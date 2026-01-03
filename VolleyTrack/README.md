# VolleyTrack

VolleyTrack is a **volleyball match tracking app** built with React, Node.js and Mongodb. It helps coaches and scouts track live match statistics, player performance, and court activity in real-time. The app provides visual analysis, including top scorers, errors, scoring zones, ball drops, and timing metrics for actions.

---

## Features

- **Team Management**

  - Create new teams with coach name and team name.
  - Add players with number, position, and playing status.
  - Select existing teams for matches.

- **Live Match Tracking**

  - Track points, errors, attacks, and tips per player.
  - Record opponent scoring zones (1–6).
  - Visualize ball drops on the volleyball court.
  - Real-time average action timing per player.
  - Save match data to backend.

- **Analysis & Visualization**
  - Charts for top scorers, contribution distribution, and errors.
  - Bar chart for opponent scoring zones.
  - Heatmap overlay for ball drops on the court.
  - Filter analysis by player position or playing status.
  - Match duration display.

---

## Scources

- Fellow students => Optimising code, helping with debugging...

- My older projects

- [OpenCode](https://opncd.ai/share/A3P4kgWv) => helping with a feature, visualizing thing, fixing errors,...

- [ChatGPT](https://chatgpt.com/share/6952b7b4-8ae4-8008-bea6-e65d33c9c6c2) => Helping with a feature, visualizing thing and fixing an error.

- [ChatGPT](https://chatgpt.com/share/69545558-70fc-8007-965f-58992cd8c043) => Helping to save my stats in my collection from my database.

- [ChatGPT](https://chatgpt.com/share/69553d2f-0c9c-8007-8f64-0f6bada23b84) => Helping with better visualization.

- [ChatGPT](https://chatgpt.com/share/69590656-fdc4-8008-9a81-860fbdd369a7) => Helping with Docker.

---

## Up & running

### Requirements

- [Docker](https://www.docker.com/) installed
- [Docker Compose](https://docs.docker.com/compose/) installed

1. Clone the repository:
```bash
git clone https://github.com/EHB-MCT/wdm-FleurVanDeVille.git
cd wdm-FleurVanDeVille
```

2. Check docker-compose.yml:
Make sure the services are correctly configured:bash
- backend: Node.js + Express, port 5500
- frontend: Vite, port 5174 (or as configured)
- mongo: MongoDB, port 27017

3. Build and start the containers:
```bash
docker-compose up --build
```
This will build and start:
- Backend at http://localhost:5500
- Frontend at http://localhost:5174/
- MongoDB database

4. Access the frontend:
Open your browser and go to: http://localhost:5174/

5. Manage the containers:
- Stop the containers:
```bash
docker-compose down
```
- Restart after code changes:
```bash
docker-compose up --build
```