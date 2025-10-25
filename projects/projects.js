

import { fetchJSON, renderProjects } from '../global.js'
const BASE_PATH = '/portfolio/';
const projects = await fetchJSON(BASE_PATH + 'lib/projects.json');
const projectsContainer = document.querySelector('.projects');

//projects.forEach(project => {
 // const img = document.createElement('img');
 // img.src = BASE_PATH + project.image;  
  //projectsContainer.appendChild(img);
//});

if (!projects || projects.length === 0) {
  const message = document.createElement('p');
  message.textContent = 'No projects found.';
  projectsContainer.appendChild(message);
} else {
  renderProjects(projects, projectsContainer, 'h2', BASE_PATH);
}

renderProjects(projects, projectsContainer, 'h2', BASE_PATH);

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `Projects (${projects.length})`;
}

