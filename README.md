
## API Reference

BASE_URL = http://localhost:3000

#### Create Order Using webhook

```http
  POST: /api/v1/stockbroker/webhook
```

| Body Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `symbol` | `string` | **Required**. Stock Symbol (eg. 'AAPL') |
| `signle` | `string` | **Required**. Stock Signle ('buy'/'sell') |

To create order with webhook.

#### Get orders

```http
  GET: /api/v1/stockbroker/get-orders
```
To get all orders


#### Get Account Info

```http
  GET: /api/v1/stockbroker/get-account-info
```
To get account info


#### Get Open Position

```http
  GET: /api/v1/stockbroker/get-open-position
```
To get open position


#### Get Filled Position

```http
  GET: /api/v1/stockbroker/get-filled-position
```
To get filled position

