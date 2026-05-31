// Firebase authentication helper for Giga auth pages

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBl1v4j0DMx-ce4rkGZpmijzyUYLLRm9NI",
  authDomain: "bai-3-2f0fc.firebaseapp.com",
  projectId: "bai-3-2f0fc",
  storageBucket: "bai-3-2f0fc.firebasestorage.app",
  messagingSenderId: "300263596892",
  appId: "1:300263596892:web:55c18b93e96985c55b3a39",
  measurementId: "G-38NJ0S7XEP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const ADMIN_EMAIL = 'admin@giga.com';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authStatus = document.getElementById('auth-status');

// ==================== Password Strength Checker ====================
function checkPasswordStrength(password) {
    if (!password) {
        return { strength: 'none', level: 0 };
    }

    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1) return { strength: 'weak', level: 1 };
    if (strength <= 3) return { strength: 'medium', level: 2 };
    return { strength: 'strong', level: 3 };
}

// ==================== Password Strength Update ====================
function updatePasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;

    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (!strengthFill || !strengthText) return;

    const password = passwordInput.value;
    const { strength, level } = checkPasswordStrength(password);

    // Clear all classes
    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';

    if (strength === 'none') {
        strengthFill.style.width = '0%';
        strengthText.textContent = '';
    } else {
        strengthFill.classList.add(strength);
        strengthText.classList.add(strength);
        
        if (strength === 'weak') {
            strengthText.textContent = '⚠️ Mật khẩu yếu';
        } else if (strength === 'medium') {
            strengthText.textContent = '⚠️ Mật khẩu trung bình';
        } else {
            strengthText.textContent = '✓ Mật khẩu mạnh';
        }
    }
}

// ==================== Password Toggle ====================
function setupPasswordToggle() {
    const loginToggle = document.getElementById('password-toggle');
    if (loginToggle) {
        const loginPassword = document.getElementById('password');
        loginToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isPassword = loginPassword.type === 'password';
            loginPassword.type = isPassword ? 'text' : 'password';
            loginToggle.innerHTML = `<i class="fas fa-eye${isPassword ? '-slash' : ''}"></i>`;
        });
    }

    // For signup form (if it has password toggle)
    if (signupForm) {
        const signupToggle = signupForm.querySelector('#password-toggle');
        if (signupToggle) {
            const signupPassword = signupForm.querySelector('#password');
            signupToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isPassword = signupPassword.type === 'password';
                signupPassword.type = isPassword ? 'text' : 'password';
                signupToggle.innerHTML = `<i class="fas fa-eye${isPassword ? '-slash' : ''}"></i>`;
            });
            
            // Update password strength on input
            signupPassword.addEventListener('input', updatePasswordStrength);
        }
    }
}

// ==================== Form Validation ====================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    if (errorElement) {
        if (message) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        } else {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
}

// ==================== Auth Status Messages ====================
function showAuthStatus(message, type = 'info') {
    if (!authStatus) return;
    authStatus.textContent = message;
    authStatus.className = `auth-status ${type}`;
}

function hideAuthStatus() {
    if (authStatus) {
        authStatus.textContent = '';
        authStatus.className = 'auth-status';
    }
}

// ==================== Form Submit State ====================
function setSubmitState(form, isLoading, label) {
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? label : submitButton.dataset.originalLabel || label;
    }
}

// ==================== Auth State Persistence ====================
function persistAuthState(user, role) {
  const normalizedRole = String(role || 'customer').toLowerCase();
  localStorage.setItem('giga_current_user_email', user.email || '');
  localStorage.setItem('giga_current_user_role', normalizedRole);
  sessionStorage.setItem('giga_current_user_email', user.email || '');
  sessionStorage.setItem('giga_current_user_role', normalizedRole);
  return normalizedRole;
}

// ==================== User Document Management ====================
async function createOrUpdateUserDoc(user, role = 'customer') {
  if (!user || !user.uid) return null;

  const normalizedRole = String(role || 'customer').toLowerCase();
  const finalRole = String(user.email).toLowerCase() === ADMIN_EMAIL ? 'admin' : (normalizedRole === 'seller' ? 'seller' : 'customer');

  try {
    const userRef = db.collection('users').doc(user.uid);
    const snapshot = await userRef.get();

    await userRef.set({
      email: user.email,
      displayName: user.displayName || '',
      role: finalRole,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...(snapshot.exists ? {} : { createdAt: firebase.firestore.FieldValue.serverTimestamp() }),
    }, { merge: true });
  } catch (error) {
    console.warn('Không thể đồng bộ hồ sơ Firestore, tiếp tục đăng nhập:', error?.message || error);
  }

  return finalRole;
}

function redirectByRole(role) {
    if (role === 'admin') return 'admin.html';
    if (role === 'seller') return 'seller.html';
    return 'index.html';
}

// ==================== LOGIN FORM HANDLER ====================
if (loginForm) {
    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.dataset.originalLabel = submitButton.textContent;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Clear previous errors
        hideAuthStatus();
        showFieldError('email', '');
        showFieldError('password', '');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me')?.checked || false;

        // Validation
        let hasError = false;
        if (!email) {
            showFieldError('email', 'Vui lòng nhập email');
            hasError = true;
        } else if (!validateEmail(email)) {
            showFieldError('email', 'Email không hợp lệ');
            hasError = true;
        }

        if (!password) {
            showFieldError('password', 'Vui lòng nhập mật khẩu');
            hasError = true;
        }

        if (hasError) return;

        setSubmitState(loginForm, true, 'Đang đăng nhập...');
        showAuthStatus('Đang đăng nhập, vui lòng chờ...', 'info');

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const role = await createOrUpdateUserDoc(userCredential.user);
            persistAuthState(userCredential.user, role);
            
            // Save remember me
            if (rememberMe) {
                localStorage.setItem('giga_remember_email', email);
            }

            showAuthStatus(`Đăng nhập thành công! Đang chuyển hướng...`, 'success');
            
            setTimeout(() => {
                window.location.href = redirectByRole(role);
            }, 700);
        } catch (error) {
            let errorMessage = 'Lỗi đăng nhập';
            
            if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found') {
                errorMessage = 'Email hoặc mật khẩu không chính xác';
            } else if (error?.code === 'auth/too-many-requests') {
                errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
            } else if (error?.code === 'auth/user-disabled') {
                errorMessage = 'Tài khoản này đã bị vô hiệu hóa';
            } else {
                errorMessage = error?.message || errorMessage;
            }
            
            showAuthStatus(errorMessage, 'error');
            setSubmitState(loginForm, false, 'Đăng nhập');
        }
    });

    // Pre-fill email if "Remember Me" was checked before
    const rememberEmail = localStorage.getItem('giga_remember_email');
    if (rememberEmail) {
        document.getElementById('email').value = rememberEmail;
        document.getElementById('remember-me').checked = true;
    }
}

// ==================== SIGNUP FORM HANDLER ====================
if (signupForm) {
    const submitButton = signupForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.dataset.originalLabel = submitButton.textContent;
    }

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Clear previous errors
        hideAuthStatus();
        showFieldError('name', '');
        showFieldError('email', '');
        showFieldError('password', '');
        showFieldError('terms', '');

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.querySelector('input[name="role"]:checked')?.value || 'customer';
        const termsAccepted = document.getElementById('terms').checked;

        // Validation
        let hasError = false;

        if (!name) {
            showFieldError('name', 'Vui lòng nhập tên hiển thị');
            hasError = true;
        } else if (name.length < 2) {
            showFieldError('name', 'Tên phải có ít nhất 2 ký tự');
            hasError = true;
        }

        if (!email) {
            showFieldError('email', 'Vui lòng nhập email');
            hasError = true;
        } else if (!validateEmail(email)) {
            showFieldError('email', 'Email không hợp lệ');
            hasError = true;
        }

        if (!password) {
            showFieldError('password', 'Vui lòng nhập mật khẩu');
            hasError = true;
        } else if (password.length < 6) {
            showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
            hasError = true;
        }

        if (!termsAccepted) {
            showFieldError('terms', 'Bạn phải đồng ý với điều khoản dịch vụ');
            hasError = true;
        }

        if (hasError) return;

        setSubmitState(signupForm, true, 'Đang tạo tài khoản...');
        showAuthStatus('Đang tạo tài khoản, vui lòng chờ...', 'info');

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
            const newRole = await createOrUpdateUserDoc(userCredential.user, role);
            persistAuthState(userCredential.user, newRole);

            showAuthStatus(`Tạo tài khoản thành công! Đang chuyển hướng...`, 'success');
            
            setTimeout(() => {
                window.location.href = redirectByRole(newRole);
            }, 700);
        } catch (error) {
            let errorMessage = 'Lỗi đăng ký';
            
            if (error?.code === 'auth/email-already-in-use') {
                showFieldError('email', 'Email này đã được sử dụng');
                errorMessage = 'Email đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.';
            } else if (error?.code === 'auth/weak-password') {
                errorMessage = 'Mật khẩu không đủ mạnh';
            } else if (error?.code === 'auth/invalid-email') {
                showFieldError('email', 'Email không hợp lệ');
                errorMessage = 'Email không hợp lệ';
            } else {
                errorMessage = error?.message || errorMessage;
            }
            
            showAuthStatus(errorMessage, 'error');
            setSubmitState(signupForm, false, 'Tạo tài khoản');
        }
    });
}

// ==================== Initialize Features ====================
setupPasswordToggle();

