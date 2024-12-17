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

## Create a Project

Creates and returns a new project.

Require Authentication: true

Request:
- Method: POST
- URL: /api/projects/new
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "name": "Marketing Campaign",
      "description": "This project focuses on the Q1 social media campaign.",
      "owner_id": 10
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
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
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "name": "Name is required",
        "description": "Description is required",
        "owner_id": "Owner is required"
      }
    }
    ```

## Get All Projects

Returns all projects.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: GET
- URL: /api/projects
- Query Parameters:
    - owner_id (optional): Filter projects by owner's user ID

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
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

## Get Single Project

Returns a specific project by ID.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: GET
- URL: /api/projects/:id

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
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
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Project couldn't be found"
    }
    ```

## Update a Project

Updates and returns an existing project.

Require Authentication: true
Authorization: User must be the owner

Request:
- Method: PUT
- URL: /api/projects/:id
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "name": "Marketing Strategy Campaign",
      "description": "Focus updated to include multi-channel advertising."
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
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
- Status Code: 400/404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Project couldn't be found"
    }
    ```

## Delete a Project

Deletes an existing project.

Require Authentication: true
Authorization: User must be the owner

Request:
- Method: DELETE
- URL: /api/projects/:id

Successful Response:
- Status Code: 204

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Project couldn't be found"
    }
    ```

# SPRINTS ENDPOINTS

## Create a Sprint

Creates and returns a new sprint for a project.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: POST
- URL: /api/projects/:projectId/sprints
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "name": "New Sprint",
      "startDate": "2023-06-15",
      "endDate": "2023-06-28"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 2,
      "projectId": 1,
      "name": "New Sprint",
      "startDate": "2023-06-15",
      "endDate": "2023-06-28"
    }
    ```

Error Response:
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "name": "Name is required",
        "startDate": "Start date is required",
        "endDate": "End date is required"
      }
    }
    ```

## Get All Sprints

Returns all sprints for a specific project.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: GET
- URL: /api/projects/:projectId/sprints

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "sprints": [
        {
          "id": 1,
          "projectId": 1,
          "name": "Sprint 1",
          "startDate": "2023-06-01",
          "endDate": "2023-06-14"
        }
      ]
    }
    ```

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Project couldn't be found or access denied"
    }
    ```

## Update a Sprint

Updates and returns an existing sprint.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: PUT
- URL: /api/sprints/:sprintId
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "name": "Updated Sprint Name",
      "startDate": "2023-06-16",
      "endDate": "2023-06-29"
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 1,
      "projectId": 1,
      "name": "Updated Sprint Name",
      "startDate": "2023-06-16",
      "endDate": "2023-06-29"
    }
    ```

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Sprint couldn't be found or access denied"
    }
    ```

## Delete a Sprint

Deletes an existing sprint.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: DELETE
- URL: /api/sprints/:sprintId

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Successfully deleted"
    }
    ```

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Sprint couldn't be found or access denied"
    }
    ```

# TASKS ENDPOINTS

## Create a Task

Creates and returns a new task.

Require Authentication: true

Request:
- Method: POST
- URL: /api/tasks
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "feature_id": "integer",
      "title": "string",
      "description": "string (optional)",
      "status": "string",
      "due_date": "date (optional)",
      "priority": "string (optional)",
      "assigned_to": "integer (optional)"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 201,
      "feature_id": 10,
      "title": "Design Homepage",
      "description": "Create wireframes for the homepage.",
      "status": "In Progress",
      "due_date": "2024-12-20",
      "priority": "High",
      "assigned_to": 12,
      "created_by": 10,
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2024-12-15T10:00:00Z"
    }
    ```

Error Response:
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "feature_id": "Feature ID is required",
        "title": "Title is required",
        "status": "Status is required"
      }
    }
    ```

## Get All Tasks

Returns all tasks for a user.

Require Authentication: true

Request:
- Method: GET
- URL: /api/tasks

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "tasks": [
        {
          "id": 201,
          "feature_id": 10,
          "title": "Design Homepage",
          "description": "Create wireframes for the homepage.",
          "status": "In Progress",
          "due_date": "2024-12-20",
          "priority": "High",
          "assigned_to": 12,
          "created_by": 10,
          "created_at": "2024-12-15T10:00:00Z",
          "updated_at": "2024-12-15T10:00:00Z"
        }
      ]
    }
    ```

# FEATURES ENDPOINTS

## Create a Feature

Creates and returns a new feature for a project.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: POST
- URL: /api/features
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "project_id": "integer",
      "name": "string",
      "position": "integer",
      "sprint_id": "integer (optional)"
    }
    ```

Successful Response:
- Status Code: 201
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 301,
      "project_id": 1,
      "name": "User Authentication Module",
      "position": 1,
      "created_by": 10,
      "sprint_id": 5,
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2024-12-15T10:00:00Z"
    }
    ```

Error Response:
- Status Code: 400
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "project_id": "Project ID is required",
        "name": "Name is required",
        "position": "Position is required"
      }
    }
    ```

## Get All Features

Returns all features for a project.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: GET
- URL: /api/features
- Query Parameters:
    - project_id (optional): Filter features by project ID

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "features": [
        {
          "id": 301,
          "project_id": 1,
          "name": "User Authentication Module",
          "position": 1,
          "created_by": 10,
          "sprint_id": 5,
          "created_at": "2024-12-15T10:00:00Z",
          "updated_at": "2024-12-15T10:00:00Z"
        },
        {
          "id": 302,
          "project_id": 1,
          "name": "Profile Page Development",
          "position": 2,
          "created_by": 12,
          "sprint_id": 5,
          "created_at": "2024-12-16T12:00:00Z",
          "updated_at": "2024-12-16T12:00:00Z"
        }
      ]
    }
    ```

## Get Single Feature

Returns a specific feature by ID.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: GET
- URL: /api/features/:id

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 301,
      "project_id": 1,
      "name": "User Authentication Module",
      "position": 1,
      "created_by": 10,
      "sprint_id": 5,
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2024-12-15T10:00:00Z"
    }
    ```

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Feature couldn't be found"
    }
    ```

## Update a Feature

Updates and returns an existing feature.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: PUT
- URL: /api/features/:id
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "name": "string (optional)",
      "position": "integer (optional)",
      "sprint_id": "integer (optional)"
    }
    ```

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "id": 301,
      "project_id": 1,
      "name": "Updated User Authentication",
      "position": 1,
      "created_by": 10,
      "sprint_id": 6,
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2024-12-16T14:00:00Z"
    }
    ```

## Delete a Feature

Deletes an existing feature.

Require Authentication: true
Authorization: User must have access to the project

Request:
- Method: DELETE
- URL: /api/features/:id

Successful Response:
- Status Code: 200
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Feature successfully deleted"
    }
    ```

Error Response:
- Status Code: 404
- Headers:
    - Content-Type: application/json
- Body:
    ```json
    {
      "message": "Feature couldn't be found"
    }
    ```
