import axios from "axios"
import { toast } from "sonner";


const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api'
})

request.interceptors.response.use(function (response) {
  if(response.data.message){
    toast.success(response.data.message);
  }
  return response;
}, function (error) {
  if(error.response.data.message){
    toast.error(error.response.data.message);
  }
  return Promise.reject(error);
});


export default request;