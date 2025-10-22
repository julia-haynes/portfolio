import { fetchJSON, renderProjects } from '../global.js'
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

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