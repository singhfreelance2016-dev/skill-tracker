// API URL - Update this with your Railway backend URL
const API_URL = 'http://localhost:5000/api/skills';

// DOM Elements
const skillForm = document.getElementById('skillForm');
const skillsList = document.getElementById('skillsList');
const filterCategory = document.getElementById('filterCategory');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeBtn = document.querySelector('.close');

// State
let currentSkills = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchSkills();
    
    // Event Listeners
    skillForm.addEventListener('submit', handleAddSkill);
    filterCategory.addEventListener('change', filterSkills);
    editForm.addEventListener('submit', handleEditSkill);
    closeBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
});

// Fetch all skills from the API
async function fetchSkills() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch skills');
        }
        const skills = await response.json();
        currentSkills = skills;
        displaySkills(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        showError('Failed to load skills. Please check your connection.');
    }
}

// Display skills in the grid
function displaySkills(skills) {
    if (!skills || skills.length === 0) {
        skillsList.innerHTML = '<div class="loading">No skills found. Add your first skill!</div>';
        return;
    }
    
    skillsList.innerHTML = skills.map(skill => createSkillCard(skill)).join('');
    
    // Add event listeners to edit and delete buttons
    skills.forEach(skill => {
        const editBtn = document.getElementById(`edit-${skill._id}`);
        const deleteBtn = document.getElementById(`delete-${skill._id}`);
        
        if (editBtn) {
            editBtn.addEventListener('click', () => openEditModal(skill));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteSkill(skill._id));
        }
    });
}

// Create HTML for a skill card
function createSkillCard(skill) {
    const proficiencyPercentage = (skill.proficiency / 10) * 100;
    
    return `
        <div class="skill-card" data-category="${skill.category}">
            <div class="skill-header">
                <h3 class="skill-name">${escapeHtml(skill.name)}</h3>
                <span class="skill-category">${escapeHtml(skill.category)}</span>
            </div>
            <div class="skill-proficiency">
                <span class="proficiency-label">Proficiency: ${skill.proficiency}/10</span>
                <div class="proficiency-bar">
                    <div class="proficiency-fill" style="width: ${proficiencyPercentage}%"></div>
                </div>
            </div>
            <div class="skill-actions">
                <button class="btn btn-edit" id="edit-${skill._id}">Edit</button>
                <button class="btn btn-delete" id="delete-${skill._id}">Delete</button>
            </div>
        </div>
    `;
}

// Handle adding a new skill
async function handleAddSkill(e) {
    e.preventDefault();
    
    const skillData = {
        name: document.getElementById('skillName').value.trim(),
        proficiency: parseInt(document.getElementById('proficiency').value),
        category: document.getElementById('category').value
    };
    
    // Validation
    if (!skillData.name || !skillData.proficiency || !skillData.category) {
        showError('Please fill in all fields');
        return;
    }
    
    if (skillData.proficiency < 1 || skillData.proficiency > 10) {
        showError('Proficiency must be between 1 and 10');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(skillData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add skill');
        }
        
        // Clear form
        skillForm.reset();
        
        // Refresh skills list
        await fetchSkills();
        
        showSuccess('Skill added successfully!');
    } catch (error) {
        console.error('Error adding skill:', error);
        showError(error.message || 'Failed to add skill. Please try again.');
    }
}

// Open edit modal with skill data
function openEditModal(skill) {
    document.getElementById('editId').value = skill._id;
    document.getElementById('editName').value = skill.name;
    document.getElementById('editProficiency').value = skill.proficiency;
    document.getElementById('editCategory').value = skill.category;
    
    editModal.style.display = 'block';
}

// Handle editing a skill
async function handleEditSkill(e) {
    e.preventDefault();
    
    const skillId = document.getElementById('editId').value;
    const skillData = {
        name: document.getElementById('editName').value.trim(),
        proficiency: parseInt(document.getElementById('editProficiency').value),
        category: document.getElementById('editCategory').value
    };
    
    // Validation
    if (!skillData.name || !skillData.proficiency || !skillData.category) {
        showError('Please fill in all fields');
        return;
    }
    
    if (skillData.proficiency < 1 || skillData.proficiency > 10) {
        showError('Proficiency must be between 1 and 10');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${skillId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(skillData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update skill');
        }
        
        // Close modal
        editModal.style.display = 'none';
        
        // Refresh skills list
        await fetchSkills();
        
        showSuccess('Skill updated successfully!');
    } catch (error) {
        console.error('Error updating skill:', error);
        showError(error.message || 'Failed to update skill. Please try again.');
    }
}

// Delete a skill
async function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete skill');
        }
        
        // Refresh skills list
        await fetchSkills();
        
        showSuccess('Skill deleted successfully!');
    } catch (error) {
        console.error('Error deleting skill:', error);
        showError(error.message || 'Failed to delete skill. Please try again.');
    }
}

// Filter skills by category
function filterSkills() {
    const category = filterCategory.value;
    
    if (category === 'all') {
        displaySkills(currentSkills);
    } else {
        const filtered = currentSkills.filter(skill => skill.category === category);
        displaySkills(filtered);
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    insertMessage(errorDiv);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    insertMessage(successDiv);
}

// Helper to insert and auto-remove messages
function insertMessage(element) {
    const container = document.querySelector('.container');
    container.insertBefore(element, container.firstChild);
    
    setTimeout(() => {
        element.remove();
    }, 3000);
}