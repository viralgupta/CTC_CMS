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
    let errorDescription = "";

    if(error.response.data?.error?.formErrors && error.response.data?.error?.formErrors.length > 0){
      errorDescription += "Form errors: ";
      error.response.data?.error?.formErrors.forEach((error: string) => {
        errorDescription += `${error}, `;
      });
    }

    if(error.response.data?.error?.fieldErrors && Object.keys(error.response.data?.error?.fieldErrors).length > 0){
      errorDescription += "Field errors: ";
      for (const [key, value] of Object.entries(error.response.data?.error?.fieldErrors as Record<string, string[]>)) {
        errorDescription += `${key}: ${value.join(", ")}`;
      }
    }

    if(error.response.data?.error?.code){
      errorDescription += `CODE: ${error.response.data?.error?.code}`
    }

    toast.error(error.response.data.message, {
      description: typeof(error.response.data.error) == "string" ? error.response.data.error : errorDescription
    });
  }
  return Promise.resolve(error);
});


export default request;