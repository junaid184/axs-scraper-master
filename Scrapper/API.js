import axios from 'axios';
import https from 'https'

const BaseUrl = "https://alexbackend.cloud/api/";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const axiosInstance = axios.create({
    BaseUrl,
    httpsAgent
});

export const fetchScrapping = () => axiosInstance.get(BaseUrl + 'event/event-scrape');
export const fetchAgents = () => axiosInstance.get(BaseUrl + 'Event/agents');
export const fetchProxies = () => axiosInstance.get(BaseUrl + 'Proxy/proxies');

export const postHeaders = (data) => axiosInstance.post(BaseUrl + 'header',data);
export const postSeats = (data) => {
  console.log(data,BaseUrl + 'event/map')
 return axiosInstance.post(BaseUrl + 'event/map',data)
};

