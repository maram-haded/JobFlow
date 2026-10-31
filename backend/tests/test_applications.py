
def create_user_and_token(client, email="user@example.com"):
    password = "TestPassword123"

    register_response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code in (200, 201)

    login_response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}"
    }


def create_application(
    client,
    token,
    company="Google",
    position="Software Engineer",
    status="APPLIED",
):
    return client.post(
        "/applications/",
        headers=auth_headers(token),
        json={
            "company": company,
            "position": position,
            "location": "Tunis",
            "status": status,
            "job_url": "https://example.com/job",
            "salary": "2500-3000 DT",
        },
    )


# 1. Authentication test

def test_applications_require_authentication(client):
    response = client.get("/applications/")

    assert response.status_code == 401


# 2. Create application

def test_create_application(client):
    token = create_user_and_token(client)

    response = create_application(client, token)

    assert response.status_code == 201

    data = response.json()

    assert data["company"] == "Google"
    assert data["position"] == "Software Engineer"
    assert data["status"] == "APPLIED"
    assert "id" in data


# 3. Get all applications

def test_get_applications(client):
    token = create_user_and_token(client)

    create_application(client, token, "Google")
    create_application(client, token, "Microsoft")

    response = client.get(
        "/applications/",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert len(response.json()) == 2


# 4. Get application by ID

def test_get_application_by_id(client):
    token = create_user_and_token(client)

    create_response = create_application(client, token)
    application_id = create_response.json()["id"]

    response = client.get(
        f"/applications/{application_id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json()["id"] == application_id


# 5. Update application

def test_update_application(client):
    token = create_user_and_token(client)

    create_response = create_application(client, token)
    application_id = create_response.json()["id"]

    response = client.put(
        f"/applications/{application_id}",
        headers=auth_headers(token),
        json={
            "company": "Updated Company",
            "position": "Senior Developer",
            "status": "INTERVIEW",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["company"] == "Updated Company"
    assert data["position"] == "Senior Developer"
    assert data["status"] == "INTERVIEW"


# 6. Delete application

def test_delete_application(client):
    token = create_user_and_token(client)

    create_response = create_application(client, token)
    application_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/applications/{application_id}",
        headers=auth_headers(token),
    )

    assert delete_response.status_code == 204

    get_response = client.get(
        f"/applications/{application_id}",
        headers=auth_headers(token),
    )

    assert get_response.status_code == 404


# 7. Search applications

def test_search_applications(client):
    token = create_user_and_token(client)

    create_application(
        client,
        token,
        company="Google",
        position="Backend Developer",
    )

    create_application(
        client,
        token,
        company="Microsoft",
        position="Frontend Developer",
    )

    response = client.get(
        "/applications/",
        params={"search": "Google"},
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    results = response.json()

    assert len(results) == 1
    assert results[0]["company"] == "Google"


# 8. Filter applications by status

def test_filter_applications_by_status(client):
    token = create_user_and_token(client)

    create_application(
        client,
        token,
        company="Company A",
        status="APPLIED",
    )

    create_application(
        client,
        token,
        company="Company B",
        status="INTERVIEW",
    )

    response = client.get(
        "/applications/",
        params={"status_filter": "INTERVIEW"},
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    results = response.json()

    assert len(results) == 1
    assert results[0]["status"] == "INTERVIEW"


# 9. Invalid status filter

def test_filter_with_invalid_status(client):
    token = create_user_and_token(client)

    response = client.get(
        "/applications/",
        params={"status_filter": "INVALID_STATUS"},
        headers=auth_headers(token),
    )

    assert response.status_code == 400


# 10. Application statistics

def test_application_statistics(client):
    token = create_user_and_token(client)

    create_application(
        client, token, "Company A", status="APPLIED"
    )
    create_application(
        client, token, "Company B", status="APPLIED"
    )
    create_application(
        client, token, "Company C", status="INTERVIEW"
    )
    create_application(
        client, token, "Company D", status="OFFER"
    )

    response = client.get(
        "/applications/stats",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 4
    assert data["by_status"]["APPLIED"] == 2
    assert data["by_status"]["INTERVIEW"] == 1
    assert data["by_status"]["OFFER"] == 1
    assert data["by_status"]["SAVED"] == 0


# 11. User cannot access another user's application

def test_user_cannot_access_another_users_application(client):
    first_token = create_user_and_token(
        client,
        "first@example.com",
    )

    second_token = create_user_and_token(
        client,
        "second@example.com",
    )

    create_response = create_application(
        client,
        first_token,
        company="Private Company",
    )

    application_id = create_response.json()["id"]

    response = client.get(
        f"/applications/{application_id}",
        headers=auth_headers(second_token),
    )

    assert response.status_code == 404


# 12. User cannot update another user's application

def test_user_cannot_update_another_users_application(client):
    first_token = create_user_and_token(
        client,
        "owner@example.com",
    )

    second_token = create_user_and_token(
        client,
        "other@example.com",
    )

    create_response = create_application(
        client,
        first_token,
    )

    application_id = create_response.json()["id"]

    response = client.put(
        f"/applications/{application_id}",
        headers=auth_headers(second_token),
        json={
            "company": "Hacked Company"
        },
    )

    assert response.status_code == 404


# 13. User cannot delete another user's application

def test_user_cannot_delete_another_users_application(client):
    first_token = create_user_and_token(
        client,
        "owner2@example.com",
    )

    second_token = create_user_and_token(
        client,
        "other2@example.com",
    )

    create_response = create_application(
        client,
        first_token,
    )

    application_id = create_response.json()["id"]

    response = client.delete(
        f"/applications/{application_id}",
        headers=auth_headers(second_token),
    )

    assert response.status_code == 404
