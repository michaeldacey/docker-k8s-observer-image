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
		
		service.post('/poll', async (req, res) => {
			try
			{
				let clusterIP: string = req.body["cluster_ip"];
				let servicePort: string = req.body["service_port"];
				
				clusterIP = clusterIP.trim();
				servicePort = servicePort.trim();
			
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
			catch(e)
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
	



