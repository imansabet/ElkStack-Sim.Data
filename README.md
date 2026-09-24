# ElkStack-Sim — Elastic Stack from Scratch

A hand-built (not directly cloned) Elastic Stack — Elasticsearch, Logstash, Beats, Kibana — powering a simple movie search app.

## Architecture / data flow

\`\`\`mermaid
flowchart LR
    subgraph Data["Data source"]
        M["movies.json.gz<br/>(6,959 movies)"]
    end

    subgraph Stack["Elastic Stack"]
        LS["Logstash<br/>(pipeline: movies)"]
        ES[("Elasticsearch<br/>elastiflix-movies")]
        LS2["Logstash<br/>(pipeline: logs)"]
        KB["Kibana"]
    end

    subgraph App["Simple app"]
        APP["Backend (Express)<br/>+ Frontend"]
    end

    subgraph Beats
        FB["Filebeat"]
        MB["Metricbeat"]
    end

    M -->|"read + enrich"| LS --> ES
    APP -->|"multi_match query"| ES
    APP -->|"JSON logs"| FB -->|"beats protocol :5044"| LS2 --> ES
    MB -->|"Docker + ES metrics"| ES
    ES --> KB
\`\`\`

## What each service does

| Service | Role |
|---|---|
| **Elasticsearch** | Stores and searches 6,959 movies; final destination for all data (movies, logs, metrics) |
| **Logstash** | Two independent pipelines: \`movies\` (reads and enriches the movie catalog from a file) and \`logs\` (receives app logs from Filebeat, ships them to a daily index) |
| **Filebeat** | Tails the backend container's JSON logs and ships them to Logstash |
| **Metricbeat** | Ships CPU/RAM/network metrics for all containers plus Elasticsearch's own node stats, directly to ES |
| **Kibana** | Explore and visualize everything stored in ES |
| **App (Backend+Frontend)** | Landing page explaining the stack + a simple search UI over the \`elastiflix-movies\` index |

## Running it

\`\`\`bash
sudo sysctl -w vm.max_map_count=262144
docker compose up -d
\`\`\`

Then open \`http://<server-IP>:3000\`

## Project structure

\`\`\`
├── docker-compose.yml
├── logstash/
│   ├── pipelines.yml
│   ├── pipeline/movies.conf   # enrichment: user_score derived from vote_average
│   ├── pipeline/logs.conf     # Beats input on port 5044
│   └── templates/movies-template.json
├── filebeat/filebeat.yml
├── metricbeat/metricbeat.yml
├── data/movies.json.gz
└── app/
    ├── backend/   # Express + search endpoint
    └── frontend/  # landing page + search UI
\`\`\`

## Credits
Inspired by the [original README-ELK.md](https://github.com/LondheShubham153/Elastiflix/blob/main/README-ELK.md) — every config here was rewritten from scratch, not copied.
