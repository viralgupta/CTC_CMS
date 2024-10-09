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
  if(import.meta.env.DEV){
    console.log("error", error.response.data);
  }
  if(error.response.data.message){
    let formErrors = "";
    let fieldErrors = "";

    if(error.response.data?.error?.formErrors && error.response.data?.error?.formErrors.length > 0){
      formErrors = "Form errors: ";
      error.response.data?.error?.formErrors.forEach((error: string) => {
        formErrors += `${error}, `;
      });
    }

    if(error.response.data?.error?.fieldErrors && Object.keys(error.response.data?.error?.fieldErrors).length > 0){
      fieldErrors = "Field errors: ";
      for (const [key, value] of Object.entries(error.response.data?.error?.fieldErrors as Record<string, string[]>)) {
        fieldErrors += `${key}: ${value.join(", ")}`;
      }
    }

    toast.error(error.response.data.message, {
      description: typeof(error.response.data.error) == "string" ? error.response.data.errors : `${formErrors} ${fieldErrors}`
    });
  }
  return Promise.resolve(error);
});


export default request;