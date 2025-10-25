console.log("IT'S ALIVE!")


// function $$(selector, context = document) {
//     return Array.from(context.querySelectorAll(selector));
// }

// const navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname ===location.pathname 
// );

// if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
// }

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server is /
    : '/portfolio/'; // GitHub Pages repo name 

let pages = [
    {url: '', title: 'Home' },
    {url: 'projects/', title: 'Projects' },
    {url: "contact/",  title: "Contact" },
    {url: "CV/", title: "CV" },
    {url: "https://github.com/julia-haynes", title: "GitHub" } 
    
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    if (!url.startsWith('http')) {
        url = BASE_PATH + url;   
}
    let title = p.title;
    let a = document.createElement('a');
a.href = url;
a.textContent = title;

a.classList.toggle(
  'current',
  a.host === location.host && a.pathname === location.pathname,
);

let isExternal = a.host && a.host !== location.host;
if (isExternal) {
  a.target = "_blank";
}

nav.append(a);

}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-select">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

let select = document.querySelector('#theme-select');

if ("colorScheme" in localStorage) {
    let savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme;
}

select.addEventListener('input', function (event) {
    console.log('color scheme changed. to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value 
    localStorage 
});

export async function fetchJSON(url) {
    try{
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {throw new Error(`Failed to fetch projects: ${response.statusText}`);} 
        const data = await response.json();
        console.log('✅ JSON data:', data);
        return data;
        //console.log(response)
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

fetchJSON('../lib/projects.json');


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    projects.forEach(project => {
        const article = document.createElement('article');
        const imageSrc = BASE_PATH + project.image
            ? project.image
            : 'https://vis-society.github.io/labs/2/images/empty.svg';
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${imageSrc}" alt="${project.title}"> 
            <p>${project.description}</p>
        `;
    containerElement.appendChild(article);
});
}

//renderProjects(projects, projectsContainer, 'h2');

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}


