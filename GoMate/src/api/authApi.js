export async function loginApi({username, password}) {
  const url = 'https://dummyjson.com/auth/login';
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password}),
  });

  const json = await res.json();
  if (!res.ok) {
    // DummyJSON returns 400 with a message field for invalid login
    const err = json && json.message ? json.message : 'Login failed';
    throw new Error(err);
  }
  return json; // contains token and user details
}

export async function registerApi({firstName, lastName, username, password}) {
  // DummyJSON supports a users/add endpoint for demo purposes
  const url = 'https://dummyjson.com/users/add';
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({firstName, lastName, username, password}),
  });

  const json = await res.json();
  if (!res.ok) {
    const err = json && json.message ? json.message : 'Registration failed';
    throw new Error(err);
  }
  return json;
}
