// Local demo account store (localStorage only)
// Uses localStorage as a browser-only demo store.

class DemoCloudDB {
    constructor() {
        this.storageKey = 'FitFindrCloudUsers';
        this.syncKey = 'FitFindrLastSync';
        this.isDemo = true;
    }

    async init() {
        console.log('🌐 Local demo store initialized');
        console.log('📱 This is a browser-only localStorage demo');
        
        // Initialize demo data if none exists
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            localStorage.setItem(this.syncKey, new Date().toISOString());
        }
        
        return true;
    }

    // Deterministic demo hash (not production password storage)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'FitFindrDemoSalt2023');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Get users from localStorage
    getCloudUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            return users;
        } catch (error) {
            console.error('Error reading demo users:', error);
            return [];
        }
    }

    // Save users to localStorage
    saveCloudUsers(users) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(users));
            localStorage.setItem(this.syncKey, new Date().toISOString());
            console.log('💾 Demo data saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving demo data:', error);
            return false;
        }
    }

    // Register new user
    async registerUser(userData) {
        try {
            const hashedPassword = await this.hashPassword(userData.password);
            
            const newUser = {
                id: Date.now(),
                fullName: userData.fullName,
                email: userData.email.toLowerCase(),
                password: hashedPassword,
                registrationDate: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                loginAttempts: 0,
                lockedUntil: null,
                membershipType: 'basic',
                profilePicture: null,
                deviceInfo: {
                    userAgent: navigator.userAgent.substring(0, 100),
                    platform: navigator.platform,
                    registeredAt: new Date().toISOString()
                }
            };

            const users = this.getCloudUsers();
            
            // Check if email already exists
            const existingUser = users.find(u => u.email === newUser.email);
            if (existingUser) {
                return { success: false, message: 'Email already exists' };
            }

            users.push(newUser);
            this.saveCloudUsers(users);

            console.log('✅ User registered in the local demo store');
            return { success: true, userId: newUser.id, user: newUser };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed: ' + error.message };
        }
    }

    // Authenticate user
    async authenticateUser(email, password) {
        try {
            const hashedPassword = await this.hashPassword(password);
            const users = this.getCloudUsers();
            const userIndex = users.findIndex(u => u.email === email.toLowerCase());

            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }

            const user = users[userIndex];

            // Check if account is locked
            if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
                return { 
                    success: false, 
                    message: 'Account temporarily locked. Try again later.' 
                };
            }

            // Check password
            if (user.password === hashedPassword) {
                // Update login info
                user.loginAttempts = 0;
                user.lockedUntil = null;
                user.lastLogin = new Date().toISOString();
                user.deviceInfo.lastLoginDevice = navigator.userAgent.substring(0, 100);
                user.deviceInfo.lastLoginPlatform = navigator.platform;
                
                users[userIndex] = user;
                this.saveCloudUsers(users);

                console.log('🎉 Demo login successful!');
                return { 
                    success: true, 
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        membershipType: user.membershipType,
                        lastLogin: user.lastLogin
                    }
                };
            } else {
                // Handle failed login
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                
                if (user.loginAttempts >= 5) {
                    user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                }
                
                users[userIndex] = user;
                this.saveCloudUsers(users);
                
                return { 
                    success: false, 
                    message: `Invalid password. ${5 - user.loginAttempts} attempts remaining.` 
                };
            }

        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, message: 'Authentication failed: ' + error.message };
        }
    }

    // Get all users for display
    async getAllUsers() {
        const users = this.getCloudUsers();
        return users.map(user => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            registrationDate: user.registrationDate,
            lastLogin: user.lastLogin,
            membershipType: user.membershipType,
            isActive: user.isActive,
            deviceInfo: user.deviceInfo
        }));
    }

    // Show local demo status
    showCrossDeviceStatus() {
        const users = this.getCloudUsers();
        const lastSync = localStorage.getItem(this.syncKey);
        
        console.log('🌐 Demo local storage status:');
        console.log(`📊 Total Users: ${users.length}`);
        console.log(`🕒 Last Sync: ${lastSync}`);
        console.log('💡 Accounts are stored only in this browser via localStorage');
        console.log('🔒 This demo does not sync across devices');
        
        return {
            totalUsers: users.length,
            lastSync: lastSync,
            isDemo: true
        };
    }

    // Check if the demo store is ready
    isReady() {
        return true;
    }

    // Reset demo data (for testing purposes)
    resetDemoData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.syncKey);
        console.log('🔄 Demo data reset - fresh start!');
    }

    // Ensure the seeded demo account exists without deleting other local accounts.
    async ensureDemoUser() {
        const users = this.getCloudUsers();
        const existingDemo = users.find(user => user.email === 'john@demo.com');
        if (existingDemo) return existingDemo;

        const result = await this.registerUser({
            fullName: 'John Smith',
            email: 'john@demo.com',
            password: 'john123',
            membershipType: 'premium'
        });

        if (!result.success) return null;

        const updatedUsers = this.getCloudUsers();
        const demoUser = updatedUsers.find(user => user.email === 'john@demo.com');
        if (demoUser) {
            demoUser.membershipType = 'premium';
            this.saveCloudUsers(updatedUsers);
        }
        return demoUser || null;
    }

    // Force create test users (for debugging)
    async forceCreateTestUsers() {
        console.log('🔧 Force creating single premium test user...');
        
        // Clear existing data
        this.resetDemoData();
        
        const testUser = {
            fullName: 'John Smith',
            email: 'john@demo.com',
            password: 'john123',
            membershipType: 'premium'
        };
        
        try {
            const result = await this.registerUser(testUser);
            if (result.success) {
                // Update membership type after creation
                const allUsers = this.getCloudUsers();
                const userIndex = allUsers.findIndex(u => u.email === testUser.email);
                if (userIndex !== -1) {
                    allUsers[userIndex].membershipType = testUser.membershipType;
                    this.saveCloudUsers(allUsers);
                }
                console.log(`✅ Force created: ${testUser.fullName} (${testUser.email}) - ${testUser.membershipType} member`);
            } else {
                console.log(`❌ Failed to force create: ${testUser.fullName} - ${result.message}`);
            }
        } catch (error) {
            console.error(`Error force creating user ${testUser.fullName}:`, error);
        }
        
        // Verify creation
        const finalUsers = this.getCloudUsers();
        console.log(`🎉 Force creation complete! Total users: ${finalUsers.length}`);
        
        // Test authentication
        try {
            const testAuth = await this.authenticateUser('john@demo.com', 'john123');
            console.log('John authentication test:', testAuth);
        } catch (error) {
            console.error('John authentication test failed:', error);
        }
        
        return finalUsers;
    }
}

// Initialize demo store
const demoCloudDB = new DemoCloudDB();

// Export for use
window.DemoCloudDB = demoCloudDB;

// Auto-initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing local demo store...');
    await demoCloudDB.init();
    
    // Check current users
    const users = demoCloudDB.getCloudUsers();
    console.log(`📊 Found ${users.length} existing users`);
    
    // Ensure the demo account exists without deleting any local accounts.
    if (users.length === 0) {
        console.log('🔧 No users found, creating demo account...');
        await demoCloudDB.forceCreateTestUsers();
    } else {
        await demoCloudDB.ensureDemoUser();
    }
    
    // Final verification
    const finalUsers = demoCloudDB.getCloudUsers();
    console.log('🎉 Demo initialization complete!');
    console.log('📋 Available test account:');
    if (finalUsers.length > 0) {
        const user = finalUsers[0];
        console.log(`   • ${user.email} (${user.fullName}) - ${user.membershipType} member`);
        console.log('💡 Login with: john@demo.com / john123');
    } else {
        console.log('   • No users found');
    }
});