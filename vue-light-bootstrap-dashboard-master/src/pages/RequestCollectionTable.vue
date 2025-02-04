<template>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <card class="strpied-tabled-with-hover"
                  body-classes="table-full-width table-responsive"
            >
              <template slot="header">
                <div style="display: flex; justify-content: space-between;padding: 0px 15px;">
                  <div>
                  <h4 class="card-title">Danh sách yêu cầu</h4>
                <p class="card-category">Danh sách các yêu cầu đã tạo</p>
                </div>
                <div>
                  <button style="border: none;border-radius: 5px;background-color: green; color: white; padding: 5px;box-shadow: 1px 1px 1px 1px lightgreen;">Thêm sản phẩm</button>
                </div>
                </div>
                
                
              </template>
              <l-table class="table-hover table-striped"
                       :columns="table1.columns"
                       :data="table1.data">
              </l-table>
            </card>
          </div>
  
          <!-- <div class="col-12">
            <card class="card-plain">
              <template slot="header">
                <h4 class="card-title">Table on Plain Background</h4>
                <p class="card-category">Here is a subtitle for this table</p>
              </template>
              <div class="table-responsive">
                <l-table class="table-hover"
                         :columns="table2.columns"
                         :data="table2.data">
                </l-table>
              </div>
            </card>
          </div> -->
  
          <!-- <div class="col-12">
            <card class="strpied-tabled-with-hover"
                  body-classes="table-full-width table-responsive"
            >
              <template slot="header">
                <h4 class="card-title">Small table</h4>
                <p class="card-category">Here is a subtitle for this table</p>
              </template>
              <l-table class="table-hover table-striped table-sm"
                       :columns="table1.columns"
                       :data="table1.data">
              </l-table>
            </card>
  
          </div> -->
  
        </div>
      </div>
    </div>
  </template>
  <script>
    import LTable from 'src/components/Table.vue'
    import Card from 'src/components/Cards/Card.vue'
    const tableColumns = ['Id', 'Name', 'Salary', 'Country', 'City']
    const tableData = [{
      id: 1,
      name: 'Dakota Rice',
      salary: '$36.738',
      country: 'Niger',
      city: 'Oud-Turnhout'
    },
    {
      id: 2,
      name: 'Minerva Hooper',
      salary: '$23,789',
      country: 'Curaçao',
      city: 'Sinaai-Waas'
    },
    {
      id: 3,
      name: 'Sage Rodriguez',
      salary: '$56,142',
      country: 'Netherlands',
      city: 'Baileux'
    },
    {
      id: 4,
      name: 'Philip Chaney',
      salary: '$38,735',
      country: 'Korea, South',
      city: 'Overland Park'
    },
    {
      id: 5,
      name: 'Doris Greene',
      salary: '$63,542',
      country: 'Malawi',
      city: 'Feldkirchen in Kärnten'
    },
    {
      id: 6,
      name: 'Mason Porter',
      salary: '$78,615',
      country: 'Chile',
      city: 'Gloucester'
    },
    {
      id: 7,
      name: 'Jon Porter',
      salary: '$98,615',
      country: 'Portugal',
      city: 'Gloucester'
    },
    {
      id: 8,
      name: 'Doris Greene',
      salary: '$63,542',
      country: 'Malawi',
      city: 'Feldkirchen in Kärnten'
    },
    {
      id: 9,
      name: 'Mason Porter',
      salary: '$78,615',
      country: 'Chile',
      city: 'Gloucester'
    },
    {
      id: 10,
      name: 'Jon Porter',
      salary: '$98,615',
      country: 'Portugal',
      city: 'Gloucester'
      },
      {
        id: 11,
        name: 'Doris Greene',
        salary: '$63,542',
        country: 'Malawi',
        city: 'Feldkirchen in Kärnten'
      }
    ]
    export default {
      components: {
        LTable,
        Card
      },
      data () {
        return {
          table1: {
            columns: [...tableColumns],
            data: [...tableData]
          },
          table2: {
            columns: [...tableColumns],
            data: [...tableData]
          }
        }
      }
    }
  </script>
  <style>
  </style>
  