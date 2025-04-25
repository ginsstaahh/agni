from airflow import DAG
from airflow.decorators import task
from airflow.providers.http.operators.http import HttpOperator
from datetime import date, datetime, timedelta, timezone
from io import StringIO
import os
import pandas as pd
import plotly.express as px


country = 'CAN'
map_key = os.environ.get('FIREMAP_API')
source = 'VIIRS_SNPP_NRT'
# current_date = date.today().strftime('%Y-%m-%d')
yesterday_date = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')

default_args = {
    'owner': 'ginsstaahh',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1),
    'retries': 0,
    'retry_delay': timedelta(minutes=1),
}

with DAG('demo_dag',
        schedule=None,
        catchup=False,
        default_args=default_args
) as dag:

    get_fire_data = HttpOperator(
        task_id='get_fire_data',
        http_conn_id='firms_conn',
        endpoint=f'api/country/csv/{map_key}/{source}/{country}/{10}/{yesterday_date}',
        method='GET',
        # response_filter=lambda response: response.json(),
        log_response=True
    )

    @task
    def map_fire_data(**kwargs):
        response = kwargs['ti'].xcom_pull(task_ids='get_fire_data')
        wildfires = pd.read_csv(StringIO(response))
        fig = px.scatter_geo(wildfires, 
                            title="Wildfires of Canada/US",
                            lat="latitude",
                            lon="longitude",
                            hover_data=["latitude", "longitude"],
                            scope="north america",
                            opacity=0.7,
                            color_discrete_sequence=['red'],
                            )

        fig.update_layout(map_style='open-street-map')
        fig.show()
        # fig.write_image('fire_plot.pdf')

get_fire_data >> map_fire_data()
