const axios = require('axios');

//put
export function putActivity(activity_type) {
	let url = "http://localhost:3000/activities/";
	let post_body.activity_type = activity_type;
	let post_body.start_time = new Date();
	return axios.put(url, post_body).catch(e => console.log(e));;
}

//get schedule up to now for today
export function getScheduleUpToNow() {
	let url = "http://localhost:3000/activities/";
	let params.end_time = new Date();
	let parmas.start_time = new Date().setHours(0,0,0,0);
	return axios.get(url, params).catch(e => console.log(e));;
}

//get current activity
export function getCurrentActivity() {
	let url = "http://localhost:3000/activities/current";
	return axios.get(url).catch(e => console.log(e));
}