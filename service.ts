import express from "express";
import Axios from 'axios';
import cors from 'cors';

class WebserviceProcess
{
	private _port: number = 1340;
		
	constructor()
	{	
	}
	
	private DumpObject(obj: any, msg: string = ""): void
	{
		let output:string = msg;
		for (var property in obj) {
			output += property + ': ' + obj[property]+'; ';
		}
		console.log(output);		
	}
	
	Start(): void
	{
		let service = express();
			
		service.get('/', (req, res) => {
			res.render('index', {});
		});
		
		
		// Enable Express to read the Request Body
		service.use(express.json()); 							// for parsing application/json
		service.use(express.urlencoded({ extended: true })); 	// for parsing application/x-www-form-urlencoded

		let corsOptions = {
		  origin: "*",
		  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		  allowedHeaders: "Authorization, Origin, Content-Type, Accept, X-Requested-With",
		  maxAge: 1728000
		  // preflightContinue: false,
		  // optionsSuccessStatus: 204
		};
		
		service.use(cors(corsOptions));
		
		// Static web pages
		console.log(`Serving pages from ${__dirname}`);
		service.use( express.static(__dirname) );
		service.set('view engine', 'ejs');
		service.set('views', __dirname);
		
		service.post('/serviceaction', async (req, res) => {
			try
			{
				//let srvtype: string = req.body["service-type"];
				let srvaction: string = req.body["service-action"].toLowerCase();
				let ip: string = req.body["ip"].trim();
				let port: string = req.body["port"].trim();
				let path: string = req.body["path"].trim();
				let body: string = req.body["reqbody"].trim();
				let response: any;
				let fullpath: string = `http://${ip}:${port}`;
				let data: any = body?JSON.parse(body):{};
				
				fullpath += path?"/"+path:""; 
				
				switch(srvaction)
				{
				case "post":
					response = await Axios.post(fullpath, data);
					break;
				case "patch":
					response = await Axios.patch(fullpath, data);
					break;
				case "put":
					response = await Axios.put(fullpath, data);
					break;
				case "delete":
					response = await Axios.delete(fullpath);
					break;
				default: // get
					response = await Axios.get(fullpath);
					break;
				}
				
				if(response.status == 200)
				{
					res.send(response.data);
				}
				else
				{
					res.status(400).send({
						status: response.status
					});
				}
			}
			catch(e: any)
			{
				res.status(500).send({
					error: e.message
				});	
			}
		});
				
		service.post('/getpod', async (req, res) => {
			try
			{
				let clusterIP: string = req.body["ip"].trim();
				let servicePort: string = req.body["port"].trim();
						
				console.log("Polling "+`http://${clusterIP}:${servicePort}/poll`);
				let pollResponse: any = await Axios.post(`http://${clusterIP}:${servicePort}/poll`, {});
				console.log(`Poll response ${pollResponse.status}`);
				if(pollResponse.status == 200)
				{
					res.send({
						pod_ip: pollResponse.data.pod_ip
					});
				}
				else
				{
					res.status(400).send({
						status: pollResponse.status
					});
				}
			}
			catch(e: any)
			{
				res.status(500).send({
					error: e.message
				});					
			}
		});			
		
		service.listen(this._port, () => console.log(`kubernetes pod running at http://localhost:${this._port}`));		
	}	
}	
	
(function ()
{
	(new WebserviceProcess()).Start();
})();
	



