# Campus Event Manager

**Author:** Gane Kwada AMALA
## 1. Project Goal
A university wants a lightweight application to manage campus events such as workshops, talks, meetups, hackathons, and student activities. 
The objective of this project is to demonstrate the ability to combine:
* Document-oriented data modeling
* Embedded objects and arrays
* MongoDB CRUD operations
* Query operators and projections
* Aggregation pipelines
* Full-stack web development

## 2. What This Project Manages
The application provides a complete interface to manage the lifecycle of campus events:
* **Event Catalog:** Create, read, update, and delete upcoming and past campus events, including capacities, locations, and tagging.
* **User Directory:** Manage a directory of students, faculty, and staff, tracking their roles, departments, and interests.
* **Participant Registrations:** Allow users to register for events, handling capacity tracking, waitlists, and cancellations directly through embedded document arrays.
* **Activity Analytics:** Generate detailed reports on event popularity, category distribution, venue occupancy, and user engagement using MongoDB aggregation pipelines.

## 3. Technology Stack
* **Database:** MongoDB (Local) using the official `mongodb` Node.js driver.
* **Frontend & Backend Framework:** Next.js 16.3.4 (App Router, Server Components, Server Actions)
* **Language:** TypeScript
* **Styling:** Vanilla CSS

## 4. How to Run the Application

### Prerequisites
* Node.js (v18+)
* A running local MongoDB server (`mongodb://127.0.0.1:27017`)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env.local` file in the root directory and ensure it points to your local MongoDB:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017
   ```

3. **Seed the Database:**
   Populate the database with sample users and events (this will clear existing data in the `campus_events` database):
   ```bash
   npm run seed
   ```
   *(Note: This creates a randomized dataset of users and events with active registrations).*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).