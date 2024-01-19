const usernameInput = document.getElementById('usernameInput');
const searchInput = document.getElementById('searchInput'); 
const repositoriesContainer = document.getElementById('repositoriesContainer');
const paginationContainer = document.getElementById('paginationContainer');
const loader = document.getElementById('loader');

const itemsPerPageOptions = [10, 20, 50, 100];
let currentPage = 1;
let itemsPerPage = itemsPerPageOptions[0];
let repositoriesData = [];
let userData = {};

function toggleDarkMode() {
    const body = document.body;

    body.classList.toggle('dark-mode');

    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const storedDarkMode = localStorage.getItem('darkMode');

    if (storedDarkMode) {
        body.classList.toggle('dark-mode', storedDarkMode === 'true');
    }
});


async function fetchGithubRepositories() {
    const username = usernameInput.value.trim();

    if (username) {
        try {
            showLoader();

            const userResponse = await fetch(`https://api.github.com/users/${username}`);
            userData = await userResponse.json();

            const repositoriesResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
            repositoriesData = await repositoriesResponse.json();

            hideLoader();

            displayUserProfile();
            displayRepositories();
        } catch (error) {
            console.error('Error fetching Github data:', error);
            hideLoader();
        }
    }
}
function openRepoModal(repo) {
    const repoModal = document.getElementById('repoModal');
    const repoNameElement = document.getElementById('repoName');
    const repoDescriptionElement = document.getElementById('repoDescription');
    const repoTopicsElement = document.getElementById('repoTopics');
    const modalOwner = document.getElementById('repoOwner');
    const repoLinkElement = document.getElementById('repoLink');
    const modalCreated = document.getElementById('repoCreated');
    const modalUpdated = document.getElementById('repoUpdated');
    const modalLanguage = document.getElementById('repoLanguage');
    const modalLicense = document.getElementById('repoLicense');
    const modalStars = document.getElementById('repoStars');
    const modalForks = document.getElementById('repoForks');
    const modalWatchers = document.getElementById('repoWatchers');
    const modalOpenIssues = document.getElementById('repoOpenIssues');
    const modalOpenPRs = document.getElementById('repoOpenPRs');
    const modalSize = document.getElementById('repoSize');

    repoNameElement.textContent = repo.name;
    repoDescriptionElement.textContent = repo.description || 'No description available.';
    repoTopicsElement.textContent = repo.topics.join(', ') || 'No topics available.';
    modalOwner.textContent = repo.owner.login;
    repoLinkElement.href = repo.html_url;
    modalCreated.textContent = new Date(repo.created_at).toLocaleDateString();
    modalUpdated.textContent = new Date(repo.updated_at).toLocaleDateString();
    modalLanguage.textContent = repo.language || 'Not specified';
    modalLicense.textContent = repo.license ? repo.license.name : 'Not specified';
    modalStars.textContent = repo.stargazers_count;
    modalForks.textContent = repo.forks_count;
    modalWatchers.textContent = repo.watchers_count;
    modalOpenIssues.textContent = repo.open_issues_count;
    modalOpenPRs.textContent = repo.open_issues_count;
    // modalSize.textContent = repo.size;

    repoModal.style.display = 'block';
}
document.querySelectorAll('.close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        document.getElementById('repoModal').style.display = 'none';
    });
});

function searchAndFetchRepositories() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredRepositories = repositoriesData.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm) || (repo.description && repo.description.toLowerCase().includes(searchTerm))
    );

    repositoriesData = filteredRepositories;

    displayRepositories();
}
function displayUserProfile() {
    const userProfileContainer = document.getElementById('userProfileContainer');
    userProfileContainer.innerHTML = `
    <div class="row userinfo">
    <div class="col-md-6 " >
        <img src="${userData.avatar_url}" alt="Profile Picture" class="img-fluid rounded-circle profile">
    </div>
    <div class="col-md-6 user">
        <h2>User Profile</h2>
        <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
        <p><strong>Username:</strong> ${userData.login}</p>
        <p><strong>Bio:</strong> ${userData.bio}</p>
        <p><strong>Followers:</strong> ${userData.followers}</p>
        <p><strong>Following:</strong> ${userData.following}</p>
        <p><strong>Public Repositories:</strong> ${userData.public_repos}</p>
    </div>
    <hr>
</div>
    `;
}

function displayRepositories() {
    repositoriesContainer.innerHTML = '';

    const repositoriesPerPage = itemsPerPage;
    const totalPages = Math.ceil(repositoriesData.length / repositoriesPerPage);

    const startIndex = (currentPage - 1) * repositoriesPerPage;
    const endIndex = startIndex + repositoriesPerPage;
    const currentRepositories = repositoriesData.slice(startIndex, endIndex);

    const row = document.createElement('div');
    row.classList.add('row');

    currentRepositories.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.classList.add('col-md-6', 'mb-3',); 
        repoCard.addEventListener('click', () => openRepoModal(repo)); 

        const card = document.createElement('div');
        card.classList.add('card', 'border', 'border-dark');

        //  card.addEventListener('click', () => {
        //     window.open(repo.html_url, '_blank');
        // });

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const repoName = document.createElement('h5');
        repoName.classList.add('card-title', 'text-primary'); 
        repoName.textContent = repo.name;

        const repoDescription = document.createElement('p');
        repoDescription.classList.add('card-text');
        repoDescription.textContent = repo.description || 'No description available.';

        const repoTopics = document.createElement('p');
        repoTopics.classList.add('card-text');
        repoTopics.textContent = `Topics: ${repo.topics.join(', ') || 'No topics available.'}`;

        cardBody.appendChild(repoName);
        cardBody.appendChild(repoDescription);
        cardBody.appendChild(repoTopics);

        card.appendChild(cardBody);
        repoCard.appendChild(card);
        row.appendChild(repoCard);
    });

    repositoriesContainer.appendChild(row);

    paginationContainer.innerHTML = '';
    const pagination = document.createElement('ul');
    pagination.classList.add('pagination','justify-content-center');

    const previousButton = createPaginationButton('Previous', currentPage > 1 ? currentPage - 1 : 1);
    pagination.appendChild(previousButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, i);
        pagination.appendChild(pageButton);
    }

    const nextButton = createPaginationButton('Next', currentPage < totalPages ? currentPage + 1 : totalPages);
    pagination.appendChild(nextButton);

    paginationContainer.appendChild(pagination);
}

function createPaginationButton(label, page) {
    const button = document.createElement('li');
    button.classList.add('page-item');

    const link = document.createElement('a');
    link.classList.add('page-link');
    link.textContent = label;

    link.addEventListener('click', () => {
        currentPage = page;
        fetchGithubRepositories();
    });

    button.appendChild(link);

    return button;
}


function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}
usernameInput.addEventListener('change', fetchGithubRepositories);
