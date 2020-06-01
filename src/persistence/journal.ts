const axios = require('axios');

//put
export async function putActivity(activity_type_parm) {
	let url = "http://localhost:3000/activities/";
	let post_body = {activity_type: activity_type_parm, start_time: new Date()};
	return axios.put(url, post_body).catch(e => console.log(e)).then(response => console.log(response));
}

//get schedule up to now for today
export async function getScheduleUpToNow() {
	let url = "http://localhost:3000/activities/";
	let params = {end_time: new Date(), start_time:  new Date().setHours(0,0,0,0)};
	return axios.get(url, params).catch(e => console.log(e)).then(response => console.log(response));
}

//get current activity
export async function getCurrentActivity() {
	let url = "http://localhost:3000/activities/current";
	return axios.get(url).catch(e => console.log(e)).then(response => console.log(response));
}