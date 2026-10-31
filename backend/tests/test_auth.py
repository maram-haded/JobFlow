
def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "TestPassword123"
        }
    )

    assert response.status_code in (200, 201)

    data = response.json()

    assert data["email"] == "testuser@example.com"
    assert "id" in data


def test_login_user(client):
    client.post(
        "/auth/register",
        json={
            "email": "loginuser@example.com",
            "password": "TestPassword123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "loginuser@example.com",
            "password": "TestPassword123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_wrong_password(client):
    client.post(
        "/auth/register",
        json={
            "email": "wrongpassword@example.com",
            "password": "TestPassword123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "wrongpassword@example.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401
