const axios = require('axios');

const base = 'http://localhost:5000';

async function run() {
  try {
    console.log('1) send-otp');
    const s = await axios.post(base + '/api/auth/send-otp', { phone: '919999999999' });
    console.log('send-otp response:', s.data);

    let otp = s.data.otp
    if (!otp) {
      // try dev fetch endpoint if available
      try {
        const f = await axios.get(base + '/dev/last-otp', { params: { phone: '919999999999' } })
        otp = f.data.otp
        console.log('Fetched OTP from /dev/last-otp')
      } catch (e) {
        console.log('/dev/last-otp not available or failed, falling back to 000000')
        otp = '000000'
      }
    }
    console.log('Using OTP:', otp);

    console.log('2) verify-otp');
    const v = await axios.post(base + '/api/auth/verify-otp', { phone: '919999999999', otp });
    console.log('verify-otp response:', v.data);

    console.log('3) signup');
    let su
    try {
      su = await axios.post(base + '/api/auth/signup', { name: 'Test User', email: 'testuser@example.com', phone: '919999999999', password: 'pass1234' });
      console.log('signup response:', su.data);
    } catch (signupErr) {
      const errData = signupErr && signupErr.response && signupErr.response.data ? signupErr.response.data : { error: signupErr.message }
      console.log('signup error:', errData)
      if (errData && (errData.error === 'User already exists' || errData.error === 'User already exists')) {
        console.log('User exists -> attempting login')
      } else {
        throw signupErr
      }
    }

    console.log('4) login');
    const lo = await axios.post(base + '/api/auth/login', { email: 'testuser@example.com', password: 'pass1234' });
    console.log('login response:', lo.data);

  } catch (err) {
    console.error('test error', {
      message: err.message,
      responseData: err && err.response ? err.response.data : null,
      responseStatus: err && err.response ? err.response.status : null,
      stack: err.stack
    })
  }
}

run();
