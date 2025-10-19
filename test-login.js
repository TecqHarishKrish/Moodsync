const axios = require('axios');

axios.post('http://localhost:5000/api/users/login', {
  email: 'test@test.com',
  password: 'test123'
})
.then(response => {
  console.log('✅ Login endpoint working!');
  console.log('Response:', response.data);
})
.catch(error => {
  console.log('Response status:', error.response?.status);
  console.log('Response data:', error.response?.data);
  if (error.response?.status === 401) {
    console.log('✅ Endpoint working (user not found is expected)');
  } else {
    console.log('❌ Error:', error.message);
  }
});
