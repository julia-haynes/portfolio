import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let xScale, yScale;

/*
async function loadData() {
  const data = await d3.csv('loc.csv');
//  console.log(data);
  return data;
}
*/

//let data = await loadData();


async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

//let commits = d3.groups(data, (d) => d.commit);

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: true,
        confirgurable: true
      });

      return ret;
    });
}

//console.log(commits);

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total lines of code
  dl.append('dt').html('Total <abbr title="Lines of code">Lines of code</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add more stats
  const numFiles = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  const longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest line length');
  dl.append('dd').text(longestLine);

  const workByPeriod = d3.rollups(
  data,
  (v) => v.length,
  (d) => new Date(d.datetime).toLocaleString("en", { dayPeriod: "short" })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append("dt").text("Most active time of day");
  dl.append("dd").text(maxPeriod); 

  const workByDay = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString("en", { weekday: "long" })
  );
  const maxDay = d3.greatest(workByDay, (d) => d[1])?.[0];
  dl.append("dt").text("Most active day");
  dl.append("dd").text(maxDay);

}

function renderScatterPlot(data, commits) {
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    const width = 1000; const height = 600;
    const svg = d3 
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      //.attr('viewBox', `-60 -20 ${width + 80} ${height + 60}`)
      .style('overflow', 'visible');

    xScale = d3
      .scaleTime()
      .domain(d3.extent(sortedCommits, (d) => d.datetime))
      .range([0, width])
      .nice();
        
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const margin = { top: 20, right: 20, bottom: 40, left: 60};

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    }

    // Update scales with new ranges 
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    //Add gridlines, before axes
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);
    //Create gridlines as an axis with no labels and full width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    //Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
    // Add x axis 
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis);
    // Add Y axis 
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis);

    const[minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
    const dots = svg.append('g').attr('class', 'dots');

    dots
      .selectAll('circle')
      .data(sortedCommits)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines))
      .style('fill-opacity', 0.7)
      .attr('fill', 'steelblue')
      .on('mouseenter', (event, commit) => {
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);})
      .on('mouseleave', () => {updateTooltipVisibility(false);});
      //.on('mouseleave', () => {d3.select('#commit-tooltip').style('visibility', 'invisible')})
      createBrushSelector(svg);

}

function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {dateStyle: 'full',});
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

function createBrushSelector(svg) {
    svg.call(d3.brush().on('start brush end', brushed));
    //Raise dots and everything after overlay
    svg.selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
    const selection = event.selection;
    d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),);
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
    if (!selection) {
        return false;} 
        const [x0, x1] = selection.map((d) => d[0]);
        const [y0, y1] = selection.map((d) => d[1]); 
        const x = xScale(commit.datetime); 
        const y = yScale(commit.hourFrac); 
        return x >= x0 && x <= x1 && y >= y0 && y <= y1; } 

function renderSelectionCount(selection){
    const selectedCommits = selection 
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
    return selectedCommits;
}

function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
    const container = document.getElementById('language-breakdown');
    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    //use d3.rollup to count lines per each language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type,);
    
    //update DOM with breakdown
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
        <dt>${language}</dt>
        <dd>${count} lines (${formatted})</dd>
        `;
    }

    
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);

console.log("Commits:", commits);
renderScatterPlot(data, commits);
