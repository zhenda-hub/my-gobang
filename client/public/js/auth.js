function toggleForm(form) {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    
    if (form === 'register') {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    } else {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginError = document.getElementById('loginError');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            loginError.textContent = data.error || '登录失败';
        }
    } catch (error) {
        loginError.textContent = '网络错误，请稍后重试';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const registerError = document.getElementById('registerError');

    if (formData.get('password') !== formData.get('confirmPassword')) {
        registerError.textContent = '两次输入的密码不一致';
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            toggleForm('login');
            document.getElementById('loginError').textContent = '注册成功，请登录';
        } else {
            registerError.textContent = data.error || '注册失败';
        }
    } catch (error) {
        registerError.textContent = '网络错误，请稍后重试';
    }
}); 