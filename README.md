# Flask React Project

This is the starter for the Flask React project.

## Getting started

1. Clone this repository (only this branch).

2. Install dependencies.

   ```bash
   pipenv install -r requirements.txt
   ```

3. Create a __.env__ file based on the example with proper settings for your
   development environment.

4. Make sure the SQLite3 database connection URL is in the __.env__ file.

5. This starter organizes all tables inside the `flask_schema` schema, defined
   by the `SCHEMA` environment variable.  Replace the value for
   `SCHEMA` with a unique name, **making sure you use the snake_case
   convention.**

6. Get into your pipenv, migrate your database, seed your database, and run your
   Flask app:

   ```bash
   pipenv shell
   ```

   ```bash
   flask db upgrade
   ```

   ```bash
   flask seed all
   ```

   ```bash
   flask run
   ```

7. The React frontend has no styling applied. Copy the __.css__ files from your
   Authenticate Me project into the corresponding locations in the
   __react-vite__ folder to give your project a unique look.

8. To run the React frontend in development, `cd` into the __react-vite__
   directory and run `npm i` to install dependencies. Next, run `npm run build`
   to create the `dist` folder. The starter has modified the `npm run build`
   command to include the `--watch` flag. This flag will rebuild the __dist__
   folder whenever you change your code, keeping the production version up to
   date.

## Deployment through Render.com

First, recall that Vite is a development dependency, so it will not be used in
production. This means that you must already have the __dist__ folder located in
the root of your __react-vite__ folder when you push to GitHub. This __dist__
folder contains your React code and all necessary dependencies minified and
bundled into a smaller footprint, ready to be served from your Python API.

Begin deployment by running `npm run build` in your __react-vite__ folder and
pushing any changes to GitHub.

Refer to your Render.com deployment articles for more detailed instructions
about getting started with [Render.com], creating a production database, and
deployment debugging tips.

From the Render [Dashboard], click on the "New +" button in the navigation bar,
and click on "Web Service" to create the application that will be deployed.

Select that you want to "Build and deploy from a Git repository" and click
"Next". On the next page, find the name of the application repo you want to
deploy and click the "Connect" button to the right of the name.

Now you need to fill out the form to configure your app. Most of the setup will
be handled by the __Dockerfile__, but you do need to fill in a few fields.

Start by giving your application a name.

Make sure the Region is set to the location closest to you, the Branch is set to
"main", and Runtime is set to "Docker". You can leave the Root Directory field
blank. (By default, Render will run commands from the root directory.)

Select "Free" as your Instance Type.

### Add environment variables

In the development environment, you have been securing your environment
variables in a __.env__ file, which has been removed from source control (i.e.,
the file is gitignored). In this step, you will need to input the keys and
values for the environment variables you need for production into the Render
GUI.

Add the following keys and values in the Render GUI form:

- SECRET_KEY (click "Generate" to generate a secure secret for production)
- FLASK_ENV production
- FLASK_APP app
- SCHEMA (your unique schema name, in snake_case)

In a new tab, navigate to your dashboard and click on your Postgres database
instance.

Add the following keys and values:

- DATABASE_URL (copy value from the **External Database URL** field)

**Note:** Add any other keys and values that may be present in your local
__.env__ file. As you work to further develop your project, you may need to add
more environment variables to your local __.env__ file. Make sure you add these
environment variables to the Render GUI as well for the next deployment.

### Deploy

Now you are finally ready to deploy! Click "Create Web Service" to deploy your
project. The deployment process will likely take about 10-15 minutes if
everything works as expected. You can monitor the logs to see your Dockerfile
commands being executed and any errors that occur.

When deployment is complete, open your deployed site and check to see that you
have successfully deployed your Flask application to Render! You can find the
URL for your site just below the name of the Web Service at the top of the page.

**Note:** By default, Render will set Auto-Deploy for your project to true. This
setting will cause Render to re-deploy your application every time you push to
main, always keeping it up to date.

[Render.com]: https://render.com/
[Dashboard]: https://dashboard.render.com/
# Mod7

  
# API DOCUMENTATION

## AUTH ENDPOINTS

### Sign Up
Creates a new user account.

Require Authentication: false

Request:
* Method: POST
* URL: /api/auth/signup
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "password123"
}
```

Successful Response:
* Status Code: 201
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

Error Response:
* Status Code: 400
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Validation error",
  "errors": {
    "email": "Email is required",
    "email": "Email must be unique",
    "first_name": "First name is required",
    "last_name": "Last name is required",
    "password": "Password must be at least 6 characters"
  }
}
```

### Log In
Logs in an existing user.

Require Authentication: false

Request:
* Method: POST
* URL: /api/auth/login
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "token": "your-auth-token"
}
```

Error Response:
* Status Code: 401
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Invalid credentials"
}
```

### Get Current User
Returns the currently logged-in user's information.

Require Authentication: true

Request:
* Method: GET
* URL: /api/auth/me

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

Error Response:
* Status Code: 401
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Authentication required"
}
```


## PROJECTS ENDPOINTS

### Create a Project
Creates and returns a new project.

Require Authentication: true

Request:
* Method: POST
* URL: /api/projects
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "name": "Marketing Campaign",
  "description": "This project focuses on the Q1 social media campaign."
}
```

Successful Response:
* Status Code: 201
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 101,
  "name": "Marketing Campaign",
  "description": "This project focuses on the Q1 social media campaign.",
  "owner_id": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T10:00:00Z"
}
```

Error Response:
* Status Code: 400
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Validation error",
  "errors": {
    "name": "Name is required",
    "description": "Description is required"
  }
}
```

### Get All Projects
Returns all projects the current user has access to.

Require Authentication: true

Request:
* Method: GET
* URL: /api/projects

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
[
  {
    "id": 101,
    "name": "Marketing Campaign",
    "description": "This project focuses on the Q1 social media campaign.",
    "owner_id": 10,
    "created_at": "2024-12-15T10:00:00Z",
    "updated_at": "2024-12-15T10:00:00Z"
  },
  {
    "id": 102,
    "name": "Website Redesign",
    "description": "Revamp the company website for a modern look.",
    "owner_id": 12,
    "created_at": "2024-12-14T09:30:00Z",
    "updated_at": "2024-12-14T09:30:00Z"
  }
]
```

### Get Single Project
Returns a specific project by ID.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: GET
* URL: /api/projects/:id

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 101,
  "name": "Marketing Campaign",
  "description": "This project focuses on the Q1 social media campaign.",
  "owner_id": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T10:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Project couldn't be found"
}
```

### Update a Project
Updates and returns an existing project.

Require Authentication: true
Authorization: User must be the owner

Request:
* Method: PUT
* URL: /api/projects/:id
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "name": "Marketing Strategy Campaign",
  "description": "Focus updated to include multi-channel advertising."
}
```

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 101,
  "name": "Marketing Strategy Campaign",
  "description": "Focus updated to include multi-channel advertising.",
  "owner_id": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T12:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Project couldn't be found"
}
```

### Delete a Project
Deletes an existing project.

Require Authentication: true
Authorization: User must be the owner

Request:
* Method: DELETE
* URL: /api/projects/:id

Successful Response:
* Status Code: 204

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Project couldn't be found"
}
```

### Add User to Project
Adds a user to a project.

Require Authentication: true
Authorization: User must be the project owner

Request:
* Method: POST
* URL: /api/projects/:projectId/users
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "user_id": 15
}
```

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "User successfully added to project"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "User or project couldn't be found"
}
```

### Remove User from Project
Removes a user from a project.

Require Authentication: true
Authorization: User must be the project owner

Request:
* Method: DELETE
* URL: /api/projects/:projectId/users/:userId

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "User successfully removed from project"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "User or project couldn't be found"
}
```



## SPRINTS ENDPOINTS

### Create a Sprint
Creates and returns a new sprint for a project.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: POST
* URL: /api/projects/:projectId/sprints
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "name": "Sprint 1",
  "start_date": "2024-01-15",
  "end_date": "2024-01-28"
}
```

Successful Response:
* Status Code: 201
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 1,
  "project_id": 101,
  "name": "Sprint 1",
  "start_date": "2024-01-15",
  "end_date": "2024-01-28",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

Error Response:
* Status Code: 400
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Validation error",
  "errors": {
    "name": "Name is required",
    "start_date": "Start date is required",
    "end_date": "End date is required"
  }
}
```

### Get All Sprints for Project
Returns all sprints for a specific project.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: GET
* URL: /api/projects/:projectId/sprints

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
[
  {
    "id": 1,
    "project_id": 101,
    "name": "Sprint 1",
    "start_date": "2024-01-15",
    "end_date": "2024-01-28",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "project_id": 101,
    "name": "Sprint 2",
    "start_date": "2024-01-29",
    "end_date": "2024-02-11",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Project couldn't be found"
}
```

### Update a Sprint
Updates and returns an existing sprint.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: PUT
* URL: /api/projects/:projectId/sprints/:sprintId
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "name": "Sprint 1 - Revised",
  "start_date": "2024-01-16",
  "end_date": "2024-01-29"
}
```

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 1,
  "project_id": 101,
  "name": "Sprint 1 - Revised",
  "start_date": "2024-01-16",
  "end_date": "2024-01-29",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Sprint couldn't be found"
}
```

### Delete a Sprint
Deletes an existing sprint.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: DELETE
* URL: /api/projects/:projectId/sprints/:sprintId

Successful Response:
* Status Code: 204

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Sprint couldn't be found"
}
```


## FEATURES ENDPOINTS

### Create a Feature
Creates and returns a new feature for a project.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: POST
* URL: /api/projects/:projectId/features
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "name": "User Authentication Module",
  "position": 1,
  "sprint_id": 5
}
```

Successful Response:
* Status Code: 201
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 301,
  "project_id": 101,
  "name": "User Authentication Module",
  "position": 1,
  "sprint_id": 5,
  "created_by": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T10:00:00Z"
}
```

Error Response:
* Status Code: 400
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Validation error",
  "errors": {
    "name": "Name is required",
    "position": "Position is required"
  }
}
```

### Get All Features for Project
Returns all features for a specific project.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: GET
* URL: /api/projects/:projectId/features

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
[
  {
    "id": 301,
    "project_id": 101,
    "name": "User Authentication Module",
    "position": 1,
    "sprint_id": 5,
    "created_by": 10,
    "created_at": "2024-12-15T10:00:00Z",
    "updated_at": "2024-12-15T10:00:00Z"
  },
  {
    "id": 302,
    "project_id": 101,
    "name": "Profile Page Development",
    "position": 2,
    "sprint_id": 5,
    "created_by": 12,
    "created_at": "2024-12-16T12:00:00Z",
    "updated_at": "2024-12-16T12:00:00Z"
  }
]
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Project couldn't be found"
}
```

### Get Single Feature
Returns a specific feature by ID.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: GET
* URL: /api/projects/:projectId/features/:featureId

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 301,
  "project_id": 101,
  "name": "User Authentication Module",
  "position": 1,
  "sprint_id": 5,
  "created_by": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T10:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Feature couldn't be found"
}
```

### Update a Feature
Updates and returns an existing feature.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: PUT
* URL: /api/projects/:projectId/features/:featureId
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "name": "Updated User Authentication",
  "position": 2,
  "sprint_id": 6
}
```

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 301,
  "project_id": 101,
  "name": "Updated User Authentication",
  "position": 2,
  "sprint_id": 6,
  "created_by": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-16T14:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Feature couldn't be found"
}
```

### Delete a Feature
Deletes an existing feature.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: DELETE
* URL: /api/projects/:projectId/features/:featureId

Successful Response:
* Status Code: 204

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Feature couldn't be found"
}
```


## TASKS ENDPOINTS

### Create a Task
Creates and returns a new task for a feature.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: POST
* URL: /api/features/:featureId/tasks
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "title": "Design Homepage",
  "description": "Create wireframes for the homepage",
  "status": "Not Started",
  "due_date": "2024-12-20",
  "priority": "High",
  "assigned_to": 12
}
```

Successful Response:
* Status Code: 201
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 201,
  "feature_id": 301,
  "title": "Design Homepage",
  "description": "Create wireframes for the homepage",
  "status": "Not Started",
  "due_date": "2024-12-20",
  "priority": "High",
  "assigned_to": 12,
  "created_by": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T10:00:00Z"
}
```

Error Response:
* Status Code: 400
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Validation error",
  "errors": {
    "title": "Title is required",
    "status": "Status must be one of: Not Started, In Progress, Completed"
  }
}
```

### Get All Tasks for Feature
Returns all tasks for a specific feature.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: GET
* URL: /api/features/:featureId/tasks

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
[
  {
    "id": 201,
    "feature_id": 301,
    "title": "Design Homepage",
    "description": "Create wireframes for the homepage",
    "status": "Not Started",
    "due_date": "2024-12-20",
    "priority": "High",
    "assigned_to": 12,
    "created_by": 10,
    "created_at": "2024-12-15T10:00:00Z",
    "updated_at": "2024-12-15T10:00:00Z"
  },
  {
    "id": 202,
    "feature_id": 301,
    "title": "Implement Login Form",
    "description": "Create login form with validation",
    "status": "In Progress",
    "due_date": "2024-12-22",
    "priority": "Medium",
    "assigned_to": 13,
    "created_by": 10,
    "created_at": "2024-12-15T11:00:00Z",
    "updated_at": "2024-12-15T11:00:00Z"
  }
]
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Feature couldn't be found"
}
```

### Get Single Task
Returns a specific task by ID.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: GET
* URL: /api/features/:featureId/tasks/:taskId

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 201,
  "feature_id": 301,
  "title": "Design Homepage",
  "description": "Create wireframes for the homepage",
  "status": "Not Started",
  "due_date": "2024-12-20",
  "priority": "High",
  "assigned_to": 12,
  "created_by": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T10:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Task couldn't be found"
}
```

### Update a Task
Updates and returns an existing task.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: PUT
* URL: /api/features/:featureId/tasks/:taskId
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "title": "Design Homepage - Updated",
  "description": "Create wireframes for the homepage with mobile version",
  "status": "In Progress",
  "due_date": "2024-12-21",
  "priority": "High",
  "assigned_to": 12
}
```

Successful Response:
* Status Code: 200
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "id": 201,
  "feature_id": 301,
  "title": "Design Homepage - Updated",
  "description": "Create wireframes for the homepage with mobile version",
  "status": "In Progress",
  "due_date": "2024-12-21",
  "priority": "High",
  "assigned_to": 12,
  "created_by": 10,
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-15T12:00:00Z"
}
```

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Task couldn't be found"
}
```

### Delete a Task
Deletes an existing task.

Require Authentication: true
Authorization: User must have access to the project

Request:
* Method: DELETE
* URL: /api/features/:featureId/tasks/:taskId

Successful Response:
* Status Code: 204

Error Response:
* Status Code: 404
* Headers:
  * Content-Type: application/json
* Body:
```json
{
  "message": "Task couldn't be found"
}
```
