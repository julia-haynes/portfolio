import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let xScale, yScale;

/*
async function loadData() {
  const data = await d3.csv('loc.csv');
//  console.log(data);
  return data;
}
*/

//let dat
// a = await loadData();


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
        enumerable: true,
        writable: true,
        configurable: true
      });

      return ret;
    });
}

//console.log(commits);

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').html("").append('dl').attr('class', 'stats');

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
    const width = 1000; const height = 400;
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
    const xAxis = d3.axisBottom(xScale).tickPadding(20);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
    // Add x axis 
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .style('font-size', '7px');
    // Add Y axis 
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .attr('class', 'y-axis')
      .call(yAxis);

    const[minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
    const dots = svg.append('g').attr('class', 'dots');

    dots
      .selectAll('circle')
      .data(sortedCommits, (d) => d.id)
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


function updateScatterPlot(filteredCommits) {
  const width = 1000;
  const height = 400;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart').select('svg');
  const xAxis = d3.axisBottom(xScale);

  xScale = xScale.domain(d3.extent(filteredCommits, (d) => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  /* CHANGE: we should clear out the existing xAxis and then create a new one.
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);
*/
  const dots = svg.select('g.dots');

  const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);
  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    //.join('circle')
    //.attr('cx', (d) => xScale(d.datetime))
    //.attr('cy', (d) => yScale(d.hourFrac))
    //.attr('r', (d) => rScale(d.totalLines))
    .join(
      enter => enter.append('circle')
        .style('--r', d => rScale(d.totalLines))
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7),

    update => update
        .style('--r', d => rScale(d.totalLines))
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7),

    exit => exit.remove()
    )
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

}


function renderTooltipContent(commit) {
    //console.log("Commit data:", commit);

    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');


    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {dateStyle: 'full',});
    time.textContent = commit.datetime?.toLocaleString('en', {timeStyle: 'short',});
    author.textContent = commit.author || 'Unknown';
    lines.textContent = commit.lines ? `${commit.lines.length} lines` : '0 lines';
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
commits.sort((a, b) => a.datetime - b.datetime)

renderCommitInfo(data, commits);

console.log("Commits:", commits);
renderScatterPlot(data, commits);

/*
let commitProgress = 100;
commits.forEach(d => {
  d.datetime = new Date(d.datetime);
});

let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

function onTimeSliderChange() {
  commitProgress = +slider.value;
    commitMaxTime = timeScale.invert(commitProgress);
    commitTimeDisplay.textContent = commitMaxTime.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short"
    });
}

slider.addEventListener("input", onTimeSliderChange);
onTimeSliderChange();
*/

/*
let commitProgress = 100;
commits.forEach(d => {
  d.datetime = new Date(d.datetime);
});

let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

function onTimeSliderChange() {
  commitProgress = +slider.value;
    commitMaxTime = timeScale.invert(commitProgress);
    commitTimeDisplay.textContent = commitMaxTime.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short"
    });
}

slider.addEventListener("input", onTimeSliderChange);
onTimeSliderChange();

*/

function updateFileDisplay(filteredCommits) {
  // Gather all lines from the filtered commits
  let lines = filteredCommits.flatMap((d) => d.lines);

  // Group by filename
  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  // Your block goes HERE ↓↓↓
  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt').append('code');
          div.append('dd');
        })
    );

  // Update content
  filesContainer.select('dt > code').text((d) => d.name);
  //filesContainer.select('dd').text((d) => `${d.lines.length} lines`);
  filesContainer
  .select('dd')
  .selectAll('div')
  .data((d) => d.lines)
  .join('div')
  .attr('class', 'loc')
  .attr('style', (d) => `--color: ${colors(d.type)}`);
}


const slider = document.getElementById("commit-progress");
const timeEl = document.getElementById("commit-time");

let commitProgress = 100;
let filteredCommits = commits;
let colors = d3.scaleOrdinal(d3.schemeTableau10);


let timeScale = d3.scaleTime()
  .domain([
    d3.min(commits, d => d.datetime),
    d3.max(commits, d => d.datetime),
  ])
  .range([0, 100]);

function onTimeSliderChange() {
  commitProgress = +slider.value;

  let commitMaxTime = timeScale.invert(commitProgress);

  // Display formatted date and time
  timeEl.textContent = commitMaxTime.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short"
  });
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  updateScatterPlot(filteredCommits);
  renderCommitInfo(data, filteredCommits);
  updateFileDisplay(filteredCommits);
}

slider.addEventListener("input", onTimeSliderChange);

// ✔ Initialize on page load
onTimeSliderChange();

d3.select('#scatter-story')
  .selectAll('.step')
  .data(commits)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
		On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
		I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
    }</a>.
		I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
  );

function onStepEnter(response) {
  const commit = response.element.__data__;
  const targetTime = commit.datetime;
  
  let filtered = commits.filter(d => d.datetime <= targetTime);
  
  updateScatterPlot(filtered);
  renderCommitInfo(data, filtered);
  updateFileDisplay(filtered);
}


const scroller = scrollama();
scroller
  .setup({
    container: '#scrolly-1',
    step: '#scrolly-1 .step',
    offset: 0.6,
    debug: false,
  })
  .onStepEnter(onStepEnter)



