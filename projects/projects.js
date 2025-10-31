

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/portfolio/';
import { fetchJSON, renderProjects } from '../global.js'
//const BASE_PATH = '/portfolio/';
//const projects = await fetchJSON(BASE_PATH + '../lib/projects.json');
const projects = await fetchJSON(BASE_PATH + '../lib/projects.json');
//const projects = await fetchJSON('lib/projects.json');
const projectsContainer = document.querySelector('.projects');

//projects.forEach(project => {
  //const img = document.createElement('img');
  //img.src = BASE_PATH + project.image;  
  //projectsContainer.appendChild(img);
//});

if (!projects || projects.length === 0) {
  const message = document.createElement('p');
  message.textContent = 'No projects found.';
  projectsContainer.appendChild(message);
} else {
  renderProjects(projects, projectsContainer, 'h2');
}

renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `Projects (${projects.length})`;
}

//import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
//let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
//let arc = arcGenerator({startAngle: 0, endAngle: 2 * Math.PI,});
//d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

//let data = [1, 2];
//let total = 0;
//for (let d of data) {total += d;}
//let angle = 0;
//let arcData = [];
//or (let d of data) {let endAngle = angle + (d/total) * 2 * Math.PI; arcData.push({ startAngle: angle, endAngle }); angle = endAngle;}
//let arcs = arcData.map((d)=> arcGenerator(d));
//arcs.forEach((arc) => {d3.select('svg').append('path').attr('d', arcs).attr('fill', 'red');});

//let colors = ['gold', 'purple'];
//arcs.forEach((arc, idx) => {d3.select('svg').append('path').attr('d', arc).attr('fill', colors[idx])});
//let arc = arcGenerator({startAngle: 0, endAngle: 2 * Math.PI,});
//let svg = d3.select('#projects-pie-plot');


//import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
/*
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let rolledData = d3.rollups( projects, (v) => v.length, (d) => d.year,);
let data = rolledData.map(([year, count]) => {return{ value: count, label: year};}); 
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map(d => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx))});

let legend = d3.select('.legend');
data.forEach((d, idx) => {legend.append('li').attr('style', `--color:${colors(idx)}`).html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); });
*/
//let query = '';
//let searchInput = document.querySelector('.searchBar');
//searchInput.addEventListener('input', (event) =>{query = event.target.value; let filteredProjects = projects.filter((project) =>{let values = Object.values(project).join('\n').toLowerCase();return values.includes(query.toLowerCase());}); renderProjects(filteredProjects, projectsContainer, 'h2');});
/*
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let rolledData = d3.rollups( filteredProjects, (v) => v.length, (d) => d.year,);
let data = rolledData.map(([year, count]) => {return{ value: count, label: year};}); 
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map(d => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
d3.select('svg').selectAll('path').remove();
d3.select('.legend').selectAll('li').remove();
arcs.forEach((arc, idx) => {d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx))});

let legend = d3.select('.legend');
data.forEach((d, idx) => {legend.append('li').attr('style', `--color:${colors(idx)}`).html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); });
*/
//let arcs = arcData.map(d => arcGenerator(d));

//});
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let query = '';
let searchInput = document.querySelector('.searchBar');
//searchInput.addEventListener('input', (event) =>{query = event.target.value; let filteredProjects = projects.filter((project) =>{let values = Object.values(project).join('\n').toLowerCase();return values.includes(query.toLowerCase());}); renderProjects(filteredProjects, projectsContainer, 'h2');});

function renderPieChart(projectsGiven) {
  d3.select('svg').selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();
  let newRolledData = d3.rollups( projectsGiven, (v) => v.length, (d) => d.year,);
  let newData = newRolledData.map(([year, count]) => {return{ value: count, label: year};}); 
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newArcs = newArcData.map(d => arcGenerator(d));
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  newArcs.forEach((arc, idx) => {d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx))});
  let legend = d3.select('.legend');
  newData.forEach((d, idx) => {legend.append('li').attr('style', `--color:${colors(idx)}`).html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); }); }

renderPieChart(projects);
searchInput.addEventListener('input', (event) =>{query = event.target.value; let filteredProjects = projects.filter((project) =>{let values = Object.values(project).join('\n').toLowerCase();return values.includes(query.toLowerCase());}); renderProjects(filteredProjects, projectsContainer, 'h2');renderPieChart(filteredProjects);});

let selectedIndex = -1
selectedIndex === i ? -1 : i;
let svg = d3.select('svg');
svg.selectAll('path').remove();
arcs.forEach((arc, i) => {svg.append('path').attr('d', arc).attr('fill', colors(i)).on('click', () => {selectedIndex = selectedIndex === i ? -1 : i; svg.selectAll('path').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : '')); legend .selectAll('li').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' :''));});});