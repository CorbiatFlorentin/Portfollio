const state = {
  lang: "fr",
  username: "CorbiatFlorentin",
  contactEmail: "florentin.corbiat@yahoo.fr",
  repoCount: 0,
  skills: [
    "JavaScript",
    "TypeScript",
    "HTML/CSS",
    "Node.js",
    "Git",
    "UI/UX",
    "Performance",
    "APIs"
  ]
};

const i18n = {
  fr: {
    role: "Développeur",
    nav_about: "Qui je suis",
    nav_projects: "Projets",
    nav_skills: "Compétences",
    nav_contact: "Contact",
    hero_title: "Spécialisé dans des expériences web sobres, rapides et soignées.",
    hero_text: "Je collabore avec des équipes qui valorisent la clarté, la cohérence et la qualité d'exécution.",
    hero_text2: "Je livre des interfaces précises en soignant la performance et les détails.",
    about_body: "Développeur curieux, je privilégie la simplicité, la lisibilité et la performance.",
    availability_title: "Disponibilité",
    availability_value: "Disponible dès maintenant — Remote",
    location: "France",
    repo_count: "repos",
    projects_title: "Projets publics",
    projects_sub: "Liste automatique via l'API GitHub.",
    projects_category: "Sélection",
    projects_empty: "Aucun projet public trouvé pour le moment.",
    skills_title: "Compétences",
    skills_sub: "Focus sur la qualité, la clarté et la performance.",
    skills_category: "Services",
    contact_title: "Contact",
    contact_sub: "Simple, direct, sans surcharge.",
    form_name: "Nom",
    form_message: "Message",
    form_send: "Envoyer",
    form_hint: "Ce formulaire envoie un email directement (backend sécurisé).",
    footer_note: "Conçu pour être rapide et léger."
  },
  en: {
    role: "Developer",
    nav_about: "About",
    nav_projects: "Projects",
    nav_skills: "Skills",
    nav_contact: "Contact",
    hero_title: "Specialized in understated, fast, and thoughtful web experiences.",
    hero_text: "I work with teams who value clarity, consistency, and strong execution.",
    hero_text2: "I ship precise interfaces with performance and detail in mind.",
    about_body: "Curious developer focused on simplicity, readability, and performance.",
    availability_title: "Availability",
    availability_value: "Available now — Remote",
    location: "France",
    repo_count: "public repos",
    projects_title: "Public projects",
    projects_sub: "Auto list via the GitHub API.",
    projects_category: "Selection",
    projects_empty: "No public projects found yet.",
    skills_title: "Skills",
    skills_sub: "Focus on quality, clarity, and performance.",
    skills_category: "Services",
    contact_title: "Contact",
    contact_sub: "Simple, direct, no bloat.",
    form_name: "Name",
    form_message: "Message",
    form_send: "Send",
    form_hint: "This form sends an email directly (secure backend).",
    footer_note: "Designed to be fast and lightweight."
  }
};

const elements = {
  repoCount: document.getElementById("repoCount"),
  projectsList: document.getElementById("projectsList"),
  projectsEmpty: document.getElementById("projectsEmpty"),
  skillsList: document.getElementById("skillsList"),
  langToggle: document.getElementById("langToggle"),
  contactForm: document.getElementById("contactForm"),
  emailLink: document.getElementById("emailLink"),
  year: document.getElementById("year")
};

function updateRepoCount() {
  const label = i18n[state.lang].repo_count;
  elements.repoCount.textContent = state.repoCount ? `${state.repoCount} ${label}` : "—";
}

function setLanguage(lang) {
  state.lang = lang;
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("data-lang", lang);

  const dict = i18n[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  updateRepoCount();
}

function renderSkills() {
  elements.skillsList.innerHTML = "";
  state.skills.forEach((skill) => {
    const item = document.createElement("li");
    item.className = "list-item";
    item.textContent = skill;
    elements.skillsList.appendChild(item);
  });
}

function repoItem(repo) {
  const item = document.createElement("li");
  item.className = "list-item";

  const description = repo.description ? repo.description : "";
  const language = repo.language ? repo.language : "";
  const stars = repo.stargazers_count ? `? ${repo.stargazers_count}` : "";

  item.innerHTML = `
    <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a></h3>
    <p>${description}</p>
    <div class="meta">
      ${language ? `<span>${language}</span>` : ""}
      ${stars ? `<span>${stars}</span>` : ""}
    </div>
  `;

  return item;
}

async function loadRepos() {
  const url = `https://api.github.com/users/${state.username}/repos?per_page=100&sort=updated`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("GitHub API error");
    const data = await response.json();

    const publicRepos = data.filter((repo) => !repo.fork && !repo.private);

    state.repoCount = publicRepos.length;
    updateRepoCount();
    elements.projectsList.innerHTML = "";

    if (publicRepos.length === 0) {
      elements.projectsEmpty.hidden = false;
      return;
    }

    elements.projectsEmpty.hidden = true;
    publicRepos.forEach((repo) => {
      elements.projectsList.appendChild(repoItem(repo));
    });
  } catch (err) {
    state.repoCount = 0;
    updateRepoCount();
    elements.projectsEmpty.hidden = false;
  }
}

function setupContact() {
  elements.emailLink.textContent = state.contactEmail;
  elements.emailLink.href = `mailto:${state.contactEmail}`;

  elements.contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(elements.contactForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    const submitButton = elements.contactForm.querySelector("button[type=\"submit\"]");
    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = state.lang === "fr" ? "Envoi…" : "Sending…";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      if (!response.ok) {
        throw new Error("Send failed");
      }

      elements.contactForm.reset();
      alert(state.lang === "fr" ? "Email envoyé avec succès." : "Email sent successfully.");
    } catch (err) {
      alert(state.lang === "fr" ? "Échec de l'envoi. Réessaie plus tard." : "Send failed. Please try again later.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
}

function setupLanguageToggle() {
  elements.langToggle.addEventListener("click", () => {
    const next = state.lang === "fr" ? "en" : "fr";
    setLanguage(next);
  });
}

function init() {
  elements.year.textContent = new Date().getFullYear();
  setLanguage(state.lang);
  renderSkills();
  loadRepos();
  setupContact();
  setupLanguageToggle();
}

init();
