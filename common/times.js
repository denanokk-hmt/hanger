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