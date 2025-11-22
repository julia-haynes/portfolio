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
    .map(([name, lines]) => ({ name, lines }));

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
  filesContainer.select('dd').text((d) => `${d.lines.length} lines`);
}
