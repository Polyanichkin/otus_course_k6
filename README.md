# k6-sampler

Simple k6 load test for OTUS

## ya.ru + www.ru (два параллельных сценария)

Скрипт: `scenarios/ya-www.js`

| Сценарий | URL | 100% профиля | 120% профиля |
|----------|-----|--------------|--------------|
| `ya_ru` | https://ya.ru | 60 req/min | 72 req/min |
| `www_ru` | http://www.ru | 120 req/min | 144 req/min |

Профиль нагрузки (оба сценария одновременно, 30 минут):

1. 5 мин — разгон до 100%
2. 10 мин — равномерная нагрузка 100%
3. 5 мин — разгон до 120%
4. 10 мин — равномерная нагрузка 120%

### InfluxDB + Grafana

```shell
docker compose up -d
```

Запуск теста с выгрузкой метрик в InfluxDB:

```shell
k6 run --out influxdb=http://127.0.0.1:8086/k6 scenarios/ya-www.js
```

**Grafana:** [http://localhost:3000](http://localhost:3000) (логин `admin` / пароль `admin`)

Дашборд k6 подключается автоматически (InfluxDB datasource `InfluxDB-k6`, dashboard *k6 Load Testing Results*).

```shell
k6 run sample.js
```

With logs:
```shell
k6 run  --log-format raw --console-output=test.log --out csv=test_result.csv sample.js
```

For debug
```shell
k6 run --http-debug="full" sample.js
```

## WebTours (эталон :1080 / регресс :1090)

Скрипт нагрузки: `webtours-load.js` (сценарий из `scenarios/webtours.js`).

Профиль: 3000 бизнес-итераций/ч (50/мин), SLA p95 &lt; 3 с на каждое HTTP-действие.

```shell
k6 run -e BASE_URL=http://webtours.load-test.ru:1080 -e STEADY_DURATION=25m webtours-load.js
k6 run -e BASE_URL=http://webtours.load-test.ru:1090 -e STEADY_DURATION=25m webtours-load.js
```

Заключение по НТ: `webtours_lt_report.md`.  
Мониторинг: http://webtours.load-test.ru:3000/d/WebTours/webtours?orgId=1

## Docker


Build docker image

```shell
docker build -t otus/k6:1.0.0 .
``` 

Start k6 test:

```shell
docker run -it --rm otus/k6:1.0.0
```
