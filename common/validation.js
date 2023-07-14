'use strict';

const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status
const svr_token = require(`./server_token_creator.js`);

const validation = function (question) {

	//var arryValidErr = {　'min_len' : 'true' };
	let exclusion_judge = false; 

	//Matching exclusion words to question.
	for (let key in conf.config.exclusion_min_length_strings) {
		//console.log(key + " : " + conf.exclusion_min_length_strings[key]);
		if (question == conf.config.exclusion_min_length_strings[key]) {
			exclusion_judge = true; 
			break;
		} else {
			exclusion_judge = false;
		}
	}

	//Validation minimum question length
	if (!exclusion_judge) {
		if (conf.config.under_min_length.question_min_length > question.length) {
			//arryValidErr['min_len'] = false;
			return {
				type : 'Validation',
				status_code : code.ERR_V_LEN_MIN_202,
				status  : status.ERR_V_LEN_MIN_202,
				approval : false,
				content  : conf.config.under_min_length,
			}
		} else if (conf.config.over_max_length.question_max_length < question.length) {
			//arryValidErr['min_len'] = false;
			return {
				type : 'Validation',
				status_code : code.ERR_V_LEN_MAX_203,
				status  : status.ERR_V_LEN_MAX_203,
				approval : false,
				content  : conf.config.over_max_length,
			}
		}
	}
	
	//arryValidErr['min_len'] = true;
	return {
		type : 'Validation',
		status_code : code.SUCCESS_ZERO,
		status  : 'Length Validation OK.',
		approval : true,
	}

};
module.exports.func = validation;

/**
 * Length for asker
 * @param {*} configs [] 
 * @param {*} question
 */
 const len = function (config, question) {

	//var arryValidErr = {　'min_len' : 'true' };
	let exclusion_judge = false; 

	//Matching exclusion words to question.
	for (let key in config['exclusion_min_length_strings']) {
		if (question == config['exclusion_min_length_strings'][key]) {
			exclusion_judge = true; 
			break;
		} else {
			exclusion_judge = false;
		}
	}

	if (!exclusion_judge) {
		if (config['under_min_length-question_min_length'] > question.length) {
			//Less length
			return {
				type : 'Validation',
				status_code : code.ERR_V_LEN_MIN_202,
				status  : status.ERR_V_LEN_MIN_202,
				approval : false,
				content  : config['under_min_length-question_min_length'],
			}
		} else if (config['over_max_length-question_max_length'] < question.length) {
			//Over length
			return {
				type : 'Validation',
				status_code : code.ERR_V_LEN_MAX_203,
				status  : status.ERR_V_LEN_MAX_203,
				approval : false,
				content  : config['over_max_length-question_max_length'],
			}
		}
	}
	
	//arryValidErr['min_len'] = true;
	return {
		type : 'Validation',
		status_code : code.SUCCESS_ZERO,
		status  : 'Length Validation OK.',
		approval : true,
	}

};
module.exports.len = len;

/**
 * Parameter is
 * @param {*} params 
 */
const isParamValue = (params) => {
	let result
	for (let key in params) {
		result = IsValue(params[key], key)
		if (!result.approval) {
			break;
		}
	}	
	return result
}
module.exports.isParamValue = isParamValue

/**
 * Value is or not
 * @param {*} value 
 * @param {*} key
 */
const IsValue = (value, key) => {
	if (value) {
		return {
			type : 'Validation',
			status_code : code.SUCCESS_ZERO,
			status_msg : `Validation OK.`,
			approval : true,
		}
	} else {
		return {
			type : 'Validation',
			status_code : code.ERR_V_IS_VAL_201,
			status_msg : `${key} ${status.ERR_V_IS_VAL_201}`,
			approval : false,
		}
	}
}

/**
 * Auth domain
 * @param {*} domain
 * @param {*} client
 */
const domainAuth = (client, domain) => {

	if (conf.env_client[client].client_domain.indexOf(domain) == -1) {
		return {
			type : "Auth",
			status_code : code.ERR_A_DOMAIN_301,
			status_msg : status.ERR_A_DOMAIN_301,
			approval : false,
		}
	}

	return {
		type : "Auth",
		status_code : code.SUCCESS_ZERO,
		status_msg : "Domain auth Success.",
		approval : true,
	}
}
module.exports.domainAuth = domainAuth;

/**
 * Major Version check
 * @param {*} version 
 */
const versionAuth = version => {
	
	if (version) {
		if (conf.version.split(".")[0] == version.split(".")[0]) {
			return {
				type : "Auth",
				status_code : code.SUCCESS_ZERO,
				status_msg : "Version auth Success.",
				approval : true,
			}
		}
	}

	return {
		type : "Auth",
		status_code : code.ERR_A_VERSION_302,
		status_msg : status.ERR_A_VERSION_302,
		version : "Version Error",
		approval : false,
	}	
}
module.exports.versionAuth = versionAuth;

/**
 * Auth Client Token
 * @param {*} client
 * @param {*} token
 */
const tokenAuthClient = (client, token) => {
	const tokens = conf.tokens_client
	for (let idx in tokens.list[client]) {
		if (tokens.list[client][idx] == token) {
			return {
				type : "Token Auth",
				status_code : code.SUCCESS_ZERO,
				status_msg : "Token auth Success.",
				approval : true,
			}
		}
	}

	return {
		type : "Auth",
		status_code : code.ERR_A_OAUTH_NON_303,
		status_msg : status.ERR_A_OAUTH_NON_303,
		approval : false,
	}
}
module.exports.tokenAuthClient = tokenAuthClient;

/**
 * Auth Token Keel
 * @param {*} token
 */
const tokenAuthKeel = (token) => {
	//console.log(conf.env.asker.token)
	//console.log(token)
	if (conf.conf_keel.token == token) {
		return {
			type : "Token Auth",
			status_code : code.SUCCESS_ZERO,
			status_msg : "Token auth Success.",
			approval : true,
		}
	}
	return {
		type : "Auth",
		status_code : code.ERR_A_OAUTH_NON_303,
		status_msg : status.ERR_A_OAUTH_NON_303,
		approval : false,
	}
}
module.exports.tokenAuthKeel = tokenAuthKeel;

/**
 * Server Token Auth
 * @param {*} sendSVC
 * @param {*} send_token
 */
const serverTokenAuth = (sendSVC, send_token) => {
	//console.log(conf.env.asker.token)
	//console.log(token)
	const recieve_token = svr_token.createRecieveToken(sendSVC, send_token)
	if (send_token == recieve_token) {
		return {
			type : "Token Auth",
			status_code : code.SUCCESS_ZERO,
			status_msg : "Token auth Success.",
			approval : true,
		}
	}
	return {
		type : "Auth",
		status_code : code.ERR_A_OAUTH_NON_303,
		status_msg : status.ERR_A_OAUTH_NON_303,
		approval : false,
	}
}
module.exports.serverTokenAuth = serverTokenAuth;

/**
 * Check open or not
 * @param {*} client
 */
const response_time = (client) => {

	let open_flg = true

	if (!conf.env_client[client].operator.response_time.require) return open_flg

	//Set now
	const dt = new Date()
	const today = getStringFromDate(dt).split(" ")
	const date = today[0]
	let time = today[1].split(":")
	time = Number(`${time[0]}${time[1]}`)
	let dayOfWeek = today[2]

	const in_time = conf.env_client[client].operator.response_time.in
	const out_time = conf.env_client[client].operator.response_time.out
	const dindenial_day = conf.env_client[client].operator.response_time.denial_day
	const dindenial_date = conf.env_client[client].operator.response_time.denaial_date

	//Checking
	if ((time - in_time) < 0 || (out_time - time) < 0) {
		open_flg = false
	} else if (dindenial_day.indexOf(dayOfWeek) >= 0) {
		open_flg = false
	} else if (dindenial_date.indexOf(date) >= 0) {
		open_flg = false
	}

	return open_flg
}
module.exports.response_time = response_time;

//日付から文字列に変換する関数
function getStringFromDate(date) {

	const year_str = date.getFullYear();
	const month_str = zeroPaddingFront("00", -2, 1 + date.getMonth()); //月だけ+1にする
	const day_str = zeroPaddingFront("00", -2, date.getDate());
	const hour_str = zeroPaddingFront("00", -2, date.getHours());
	const minute_str = zeroPaddingFront("00", -2, date.getMinutes());
	let second_str = zeroPaddingFront("00", -2, date.getSeconds());

	let format_str = 'YYYYMMDD hh:mm:ss';
	format_str = format_str.replace(/YYYY/g, year_str);
	format_str = format_str.replace(/MM/g, month_str);
	format_str = format_str.replace(/DD/g, day_str);
	format_str = format_str.replace(/hh/g, hour_str);
	format_str = format_str.replace(/mm/g, minute_str);
	format_str = format_str.replace(/ss/g, second_str);

	var dayOfWeek = date.getDay() ;	// 曜日(数値)
	var dayOfWeekStr = [ "日", "月", "火", "水", "木", "金", "土" ][dayOfWeek]

	return `${format_str} ${dayOfWeekStr}`;
};
module.exports.getStringFromDate = getStringFromDate

//Zero padding
function zeroPaddingFront(zero, dig, number) {
	return (zero + number).slice( dig );
}