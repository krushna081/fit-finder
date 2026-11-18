// Login Page JavaScript

let dbReady = false;
let dbInitPromise = null;

// Initialize database when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading indicator
    showDatabaseStatus('Initializing demo...', 'loading');
    
    try {
        // Wait for the local demo store to be available
        if (!window.DemoCloudDB) {
            throw new Error('DemoCloudDB not loaded');
        }
        
        // Initialize demo storage with retry logic
        dbInitPromise = initializeDatabase();
        await dbInitPromise;
        
        dbReady = true;
        console.log('Demo storage initialized successfully');
        showDatabaseStatus('Demo ready', 'success');
        
        // Clean expired sessions
        await window.DemoCloudDB.showCrossDeviceStatus();
        
        // Hide status after 2 seconds
        setTimeout(() => hideDatabaseStatus(), 2000);
        
    } catch (error) {
        console.error('Demo storage initialization failed:', error);
        showDatabaseStatus('Demo storage initialization failed. Retrying...', 'error');
        
        // Retry after 2 seconds
        setTimeout(async () => {
            try {
                if (window.DemoCloudDB) {
                    await window.DemoCloudDB.init();
                    dbReady = true;
                    showDatabaseStatus('Demo ready', 'success');
                    setTimeout(() => hideDatabaseStatus(), 2000);
                } else {
                    throw new Error('DemoCloudDB still not available');
                }
            } catch (retryError) {
                console.error('Demo storage retry failed:', retryError);
                showDatabaseStatus('Demo storage unavailable. Please refresh the page.', 'error');
            }
        }, 2000);
    }

    setupLoginForm();
});

// Initialize demo storage with better error handling
async function initializeDatabase() {
    if (!window.DemoCloudDB) {
        throw new Error('DemoCloudDB class not available');
    }
    
    return await window.DemoCloudDB.init();
}

// Show database status with animations
function showDatabaseStatus(message, type) {
    let statusDiv = document.getElementById('db-status');
    
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'db-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        document.body.appendChild(statusDiv);
    }
    
    const animations = {
        loading: {
            bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            icon: 'fas fa-spinner fa-spin',
            animation: 'slideInBounce 0.6s ease-out, pulse 2s infinite'
        },
        success: {
            bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            icon: 'fas fa-check-circle',
            animation: 'slideInSuccess 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), successGlow 1s ease-in-out'
        },
        error: {
            bg: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            color: 'white',
            icon: 'fas fa-exclamation-triangle',
            animation: 'slideInShake 0.6s ease-out, errorShake 0.5s ease-in-out 0.6s'
        }
    };
    
    const style = animations[type] || animations.loading;
    
    // Add CSS animations if not already added
    if (!document.getElementById('message-animations')) {
        const animationStyles = document.createElement('style');
        animationStyles.id = 'message-animations';
        animationStyles.textContent = `
            @keyframes slideInBounce {
                0% { transform: translateX(-50%) translateY(-100px) scale(0.8); opacity: 0; }
                60% { transform: translateX(-50%) translateY(10px) scale(1.05); opacity: 1; }
                100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
            }
            
            @keyframes slideInSuccess {
                0% { transform: translateX(-50%) translateY(-100px) scale(0.5) rotate(-10deg); opacity: 0; }
                50% { transform: translateX(-50%) translateY(5px) scale(1.1) rotate(5deg); opacity: 1; }
                100% { transform: translateX(-50%) translateY(0) scale(1) rotate(0deg); opacity: 1; }
            }
            
            @keyframes slideInShake {
                0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                50% { transform: translateX(-50%) translateY(0); opacity: 1; }
                60% { transform: translateX(-45%) translateY(0); }
                70% { transform: translateX(-55%) translateY(0); }
                80% { transform: translateX(-48%) translateY(0); }
                90% { transform: translateX(-52%) translateY(0); }
                100% { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
                50% { box-shadow: 0 6px 30px rgba(102, 126, 234, 0.4); }
            }
            
            @keyframes successGlow {
                0% { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
                50% { box-shadow: 0 8px 40px rgba(17, 153, 142, 0.6), 0 0 20px rgba(56, 239, 125, 0.3); }
                100% { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
            }
            
            @keyframes errorShake {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                25% { transform: translateX(-48%) translateY(0); }
                75% { transform: translateX(-52%) translateY(0); }
            }
            
            @keyframes slideOut {
                0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
                100% { transform: translateX(-50%) translateY(-100px) scale(0.8); opacity: 0; }
            }
        `;
        document.head.appendChild(animationStyles);
    }
    
    statusDiv.style.background = style.bg;
    statusDiv.style.color = style.color;
    statusDiv.style.animation = style.animation;
    const statusIcon = document.createElement('i');
    statusIcon.className = style.icon;
    statusIcon.style.marginRight = '8px';
    statusIcon.setAttribute('aria-hidden', 'true');
    statusDiv.replaceChildren(statusIcon, document.createTextNode(message));
    statusDiv.style.opacity = '1';
    statusDiv.style.transform = 'translateX(-50%) translateY(0)';
}

// Hide database status with animation
function hideDatabaseStatus() {
    const statusDiv = document.getElementById('db-status');
    if (statusDiv) {
        statusDiv.style.animation = 'slideOut 0.4s ease-in-out';
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 400);
    }
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Wait for database if it's still initializing
            if (!dbReady && dbInitPromise) {
                showDatabaseStatus('Waiting for demo storage...', 'loading');
                try {
                    await dbInitPromise;
                    dbReady = true;
                    hideDatabaseStatus();
                } catch (error) {
                    showDatabaseStatus('Demo storage error. Please refresh the page.', 'error');
                    return;
                }
            }
            
            if (!dbReady) {
                alert('Demo storage not available. Please refresh the page and try again.');
                return;
            }
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show loading state
            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.innerHTML;
            
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            loginBtn.disabled = true;
            
            try {
                // Authenticate user
                console.log('Attempting login with:', email);
                const result = await window.DemoCloudDB.authenticateUser(email, password);
                console.log('Authentication result:', result);
                
                if (result.success) {
                    // Store user data (no session creation needed for demo)
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', result.user.email);
                    localStorage.setItem('userName', result.user.fullName);
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('membershipType', result.user.membershipType);
                    
                    showDatabaseStatus(`Welcome back, ${result.user.fullName}!`, 'success');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1000);
                } else {
                    alert(result.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            } finally {
                // Reset button
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}