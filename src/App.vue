
<template>
  <div>
    <header>
      <div class="search">
        <el-input
          v-model="url"
          size="small"
          class="url"
          placeholder="抽奖地址:如:https://webstatic.mihoyo.com/XXX"
        />
        <el-button
          class="button"
          color="#626aef"
          size="small"
          style="color: white"
          @click="queryFn"
          id=""
          :icon="Search"
          >查询</el-button
        >
        <el-button
          class="button"
          color="#626aef"
          size="small"
          style="color: white"
          @click="loadLocal"
          id=""
          :icon="TakeawayBox"
          >导入本地数据</el-button
        >
        <el-button
          v-show="DataShow"
          class="button"
          color="#626aef"
          size="small"
          style="color: white"
          @click="Export"
          :icon="Download"
          >导出Excel表格</el-button
        >
      </div>
    </header>
    <div class="text">{{ tips }}</div>
    <div class="schart" v-show="DataShow">
      <div class="schart-item" v-for="(item, index) in chartsData" :key="index" v-show="item.total > 0">
        <h3>{{ item.title }}</h3>
        <p class="gray">{{ item.startTime }} 至 {{ item.endTime }}</p>
        <div class="chart-box">
          <v-chart class="chart" :option="item.options" autoresize></v-chart>
        </div>
        <div class="text-box">
            <p>
              一共：<el-tag class="tag" size="small">{{ item.total }}</el-tag> <span v-if="item.noGoldTimes">已累计
              <el-tag class="tag" size="small">
                {{ item.noGoldTimes }}
              </el-tag>
              抽未出金</span>
            </p>
            
            <ul class="">
              <li class="gold">
                五星：{{ item.level_5.count }} <el-tag class="tag" size="small">{{ item.level_5.chance }}</el-tag>
              </li>
              <li class="purple">
                四星：{{ item.level_4.count }} <el-tag class="tag" size="small">{{ item.level_4.chance }}</el-tag>
              </li>
              <li class="blue">
                三星：{{ item.level_4.count }} <el-tag class="tag" size="small">{{ item.level_3.chance }}</el-tag>
              </li>
            </ul>
            <p class="gold" v-if="item.level_5.count">
              五星历史记录：
              <span v-for="(item, index) in item.level_5.list" :key="item[0]">
                <el-tag size="small" type="success" class="tag">
                  {{ `${item[1]}(${item[5]})` }}
                </el-tag>
              </span>
            </p>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { Search, Download, TakeawayBox } from '@element-plus/icons-vue'
import { local } from "./util/storage";
import { GachaUrl } from "./api/baseUrl";
import { getGachaLog, gachaTypes as gachaType } from "./api/data";
import { sleep, statistical, getTitle } from "./util/method";
import {save} from './util/save'
const DataShow = ref(false);
const url = ref(""); //new URL(GachaUrl);
const tips = ref("");
const chartsData = ref(reactive([]))

let AuthKey = "";
let AuthKeyVer = "1";
let Lang = "zh-cn";


const configStyle = {
  key2title: {
    level_3_Weapons: '三星武器',
    level_4_weapons: '四星武器',
    level_5_weapons: '五星武器',
    level_4_role: '四星角色',
    level_5_role: '五星角色'
  },
  style: {
    level_3_Weapons: 'blue',
    level_4_weapons: 'purple',
    level_5_weapons: 'gold',
    level_4_role: 'purple',
    level_5_role: 'gold',
    level_4: 'purple',
    level_5: 'gold',
    level_3: 'blue'
  }
}

const tmpData = reactive({
  level_3_Weapons: [],
  level_4_role: [],
  level_4_weapons: [],
  level_5_role: [],
  total: 0,
  noGoldTimes: 0,
  probability: [],
}); //up角色数据

//获取每一页数据
const getGachaLogs = async (name, key) => {
  let page = 1,
    data = [],
    res = [];
  let end_id = "0";
  let list = [];
  do {
    // console.log(`正在获取${name}第${page}页`);
    tips.value = `正在获取${name}第${page}页`;
    res = await getGachaLog(key, page, end_id, AuthKey, AuthKeyVer, Lang);
    await sleep(1);
    end_id =
      res.data.list.length > 0 ? res.data.list[res.data.list.length - 1].id : 0;
    list = res.data.list;
    data.push(...list);
    page += 1;
  } while (list.length > 0);
  return data;
};

//生成抽奖数据
const main = async (uri) => {
  // console.log(uri);
  uri = uri ? new URL(uri) : new URL(GachaUrl);
  AuthKey = uri.searchParams.get("authkey"); //获取密钥
  if (!AuthKey) {
    console.error("AuthKey 获取失败!");
    ElMessage.warning(`地址不正确，AuthKey 获取失败!`);
    return;
  }
  if (AuthKey.includes("/")) {
    AuthKey = encodeURIComponent(AuthKey);
  }
  AuthKeyVer = uri.searchParams.get("authkey_ver") || "1";
  Lang = uri.searchParams.get("lang") || "zh-cn";

  const gachaTypes = await gachaType(AuthKey, AuthKeyVer, Lang);
  tips.value = "开始获取抽卡记录";
  // let GachData = [];
  let GachDataObj = {};
  for (const type of gachaTypes) {
    // console.log("type:", gachaTypes);
    let gacha_type = type.key;
    // get gacha logs
    const logs = (await getGachaLogs(type.name, type.key)).map((item) => {
      return [item.time, item.name, item.item_type, parseInt(item.rank_type)];
    });
    logs.reverse();
    let idx = 0,
      pdx = 0;
    for (let log of logs) {
      idx += 1;
      pdx += 1;
      log.push(idx, pdx);
      if (log[3] === 5) {
        pdx = 0;
      }
    }
    //第一个数据
    GachDataObj[gacha_type] = logs;
  }
  console.log("获取抽卡记录结束");
  tips.value = "获取抽卡记录完成";
  // console.log(GachData);
  genCharts(GachDataObj);
  //保存本地
  local.set("GachDataObj", GachDataObj);
};

//查询
const queryFn = () => {
  if (!url.value) {
    tips.value = '请输入url'
    return false
  }
  main(url.value);
};

const loadLocal = () => {
  let localData = local.get('GachDataObj')
  if (localData) {
    genCharts(localData)
  }
}

// 生成图数组
const genCharts = (dataObj) => {
  DataShow.value = true; //显示数据

  Object.keys(dataObj).forEach((key, index) => {
    const result = Upactivity(dataObj[key], key)
    chartsData.value.push(result)
  })
}

//up扇形图
/**
 * "200" "常驻祈愿"
 * "100" "新手祈愿"
 * "301""角色活动祈愿"
 * "302""武器活动祈愿"
 */
const Upactivity = (dataObj, key) => {
  let tmpObj = reactive({
    title: '',
    total: 0,
    noGoldTimes: 0,
  }); //up角色数据

  let data = statistical(dataObj);
  
  tmpObj = Object.assign(tmpObj, data)
  tmpObj.title = getTitle(key);

  const chartData = [
    {
      value: data.level_3_Weapons.length,
      name: "三星武器",
    },
    {
      value: data.level_4_role.length,
      name: "四星角色",
    },
    {
      value: data.level_4_weapons.length,
      name: "四星武器",
    },
    {
      value: data.level_5_role.length,
      name: "五星角色",
    },
    { value: data.level_5_weapons.length, name: "五星武器" },
  ]
  
  let config = {
    // title: { text: getTitle(key), left: 'center' },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      show: true
    },
    series: [
      {
        name: "数量",
        type: "pie",
        data: chartData.filter(item => item.value > 0),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
    ],
    radius: '50%',
    center: ["50%", "60%"],
  };

  tmpObj.options = config
  
  return tmpObj
};

//导出表格数据
const Export = ()=>{
  console.log(`导出表格数据`,);
  let data = local.get('GachDataObj')
  save(data)
}
</script>

<style scoped>

</style>
