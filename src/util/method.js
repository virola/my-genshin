import {
    local
} from './storage'
//休眠
const sleep = (s) => new Promise(resolve => {
    setTimeout(resolve, s * 1000)
})
//统计角色武器数量
/**
 * 
 * @param {Object} data 
 * @returns {Object}
 */
const statistical = (data) => {
    const pool = data || []
    if (!pool) return
    // console.log(pool);
    if (pool === undefined) return;
    let level_5_role = []; //角色
    let level_5_weapons = []; //武器
    let level_4_role = [];
    let level_4_weapons = [];
    let level_3_Weapons = [];
    let startTime = ''
    let endTime = ''
    // 5⭐记录
    let level_5_list = [];

    for (let i = 0; i < pool.length; i++) {
        // [ 时间, 名字, 类型, 等级, 数量, 未出金数 ]
        // [ "2021-10-01 10:45:59", "魔导绪论", "武器", 3, 9, 9 ]
        let item = pool[i];
        
        switch (item[3]) {
            case 3:
                level_3_Weapons.push(item);
                break;
            case 4:
                item[2] === "角色" ?
                    level_4_role.push(item) :
                    level_4_weapons.push(item);
                break;
            case 5:
                level_5_list.push(item)
                item[2] === "角色" ?
                    level_5_role.push(item) :
                    level_5_weapons.push(item);
                break;
            default:
                console.log("判断出错");
                break;
        }
    }
    const total = pool.length
    // console.log(total)
    let noGoldTimes = ''
    if (total) {
        
        const arr = pool[total - 1]
        if (arr[5]) {
            noGoldTimes = arr[5] || 0
        }
        startTime = pool[0][0]
        endTime = arr[0]
    }
    return {
        level_5: {
            list: level_5_list,
            count: (level_5_role.length + level_5_weapons.length),
            chance: percentage((level_5_role.length + level_5_weapons.length) / pool.length)
        },
        level_4: {
            count: (level_4_role.length + level_4_weapons.length),
            chance: percentage((level_4_role.length + level_4_weapons.length) / pool.length)
        },
        level_3: {
            count: level_3_Weapons.length,
            chance: percentage(level_3_Weapons.length / pool.length)
        },
        level_5_role: level_5_role,
        level_5_weapons: level_5_weapons,
        level_4_role: level_4_role,
        level_4_weapons: level_4_weapons,
        level_3_Weapons: level_3_Weapons,
        total,
        noGoldTimes, //目前已抽次数
        startTime,
        endTime,
    };
};
//计算百分比
const percentage = num => {
    if (!num) {
        return '-';
    }
    return Math.round(num * 10000) / 100 + `%`;
}
//
const Obj = {
    "200": "常驻祈愿",
    "100": "新手祈愿",
    "301": "角色活动祈愿",
    "400": "角色活动祈愿-2",
    "302": "武器活动祈愿",
}
/**
 * key TO 标题
 */
const getTitle = num => Obj[num]
export {
    sleep,
    statistical,
    getTitle
}