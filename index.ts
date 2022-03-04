class IndexPage
{
	private _discoveredPods: string[] = [];
	private _timer: any = null;
	
	constructor()  { } 
	
	Start(): void
	{
		this.UpdateServiceForm("clusterip", true);
		this.UpdatePathPrefix();
		
		$("#action-button").click(this.ActionButtonClick);
		$("#start-poll-button").click(this.StartPollButtonClick);
		$("#stop-poll-button").click(this.StopPollButtonClick);
		
		$("#service-action").change((e : JQuery.Event) => {
			let action: string = String($("#service-action").val());

			switch(action)
			{
				case "post":
					$("#req-body-textbox").prop('disabled', false);
					break;
				case "put":
					$("#req-body-textbox").prop('disabled', false);
					break;
				case "patch":
					$("#req-body-textbox").prop('disabled', false);
					break;
				case "delete":
					$("#req-body-textbox").prop('disabled', true);
					break;
				default:   // get
					$("#req-body-textbox").prop('disabled', true);
					break;
			}
			
			e.preventDefault();
			return false;
		});

		$("#service-type").change((e : JQuery.Event) => {
			let stype: string = String($("#service-type").val());

			this.UpdateServiceForm(stype);
			this.UpdatePathPrefix();
			
			e.preventDefault();
			return false;
		});			
	}
	
	private UpdateServiceForm(stype: string, init: boolean = false): void
	{
		let description: string = "";
		let ipdescription: string = "";
		let ipvalue: string = "";
		let portdescription: string = "";
		let portvalue: string = "";
		let buttontitle: string = "";
		
		switch(stype)
		{
			case "internal":
				description = "Communicate between containers in the same pod. The IP address is identical for all containers in the same pod.";
				ipdescription = "Destination container name";
				ipvalue = "";
				portdescription = "Target Port";
				portvalue = "1339";
				buttontitle = "Set targetPort";
				break;
			case "nodeport":
				description = "NodePort: internal/external service, using IP of a node within the cluster";
				ipdescription = "NodeIP or DNS";
				ipvalue = "0.0.0.0";
				portdescription = "Node Port";
				portvalue = "1339";
				buttontitle = "Set nodePort";
				break;
			case "lb":
				description = "Load Balancer: external service, use external IP address of service";
				ipdescription = "External Service IP or DNS";
				ipvalue = "0.0.0.0";
				portdescription = "Service Port";
				portvalue = "1339";
				buttontitle = "Set External IP";
				break;
			case "ingress":
				description = "Ingress: external service, use external IP address of service";
				ipdescription = "External Ingress IP or DNS";
				ipvalue = "0.0.0.0";
				portdescription = "Service Port (80/443)";
				portvalue = "80";
				buttontitle = "Set External IP";
				break;
			case "clusterip":
				description = "ClusterIP: internal service, using cluster IP or service name FQDN=&lt;service-name&gt;.&lt;namespace-name&gt;.svc.cluster.local or shorthand this by just using the service name Used for pod to pod communication within a cluster (across nodes)";
				ipdescription = "ClusterIP or DNS";
				ipvalue = "0.0.0.0";
				portdescription = "Service Port";
				portvalue = "1339";
				buttontitle = "Set Cluster IP";
			default:
				break;
		}
		if(init)
		{
			$("#ip-textbox").off("change", this.UpdatePathPrefix);
			$("#port-textbox").off("change", this.UpdatePathPrefix);
		}		
		$("#service-details").html(`<span>${description}</span>
<br/><label for="ip-textbox">${ipdescription}:</label>
<input id="ip-textbox" name="ip-textbox" type="text" value="${ipvalue}" />
<br/><label for="port-textbox">${portdescription}:</label>
<input id="port-textbox" name="port-textbox" type="text" value="${portvalue}" />`);
		$("#ip-textbox").change(this.UpdatePathPrefix);	
		$("#port-textbox").change(this.UpdatePathPrefix);

	}
	
	private UpdatePathPrefix(): void
	{
		let ip: string = String($("#ip-textbox").val());
		let port: string = String($("#port-textbox").val());
		$("#path-prefix").html(`http://${ip}:${port}/`);	
	}
	
	private StartPollButtonClick = (e : JQuery.Event) => {
		this.Poll();
		$("#start-poll-button").prop('disabled', true);
		$("#stop-poll-button").prop('disabled', false);
		e.preventDefault();
		return false;
	};
	
	private StopPollButtonClick = (e : JQuery.Event) => {
		if(this._timer !== null) clearTimeout(this._timer);
		this._timer = null;
		$("#start-poll-button").prop('disabled', false);
		$("#stop-poll-button").prop('disabled', true);
		e.preventDefault();
		return false;
	};
	
	private Poll = () => 
	{
		let ip: string = String($("#getp-ip-textbox").val());
		let port: string = String($("#getp-port-textbox").val());
		$.ajax({
			cache: false,
			type: "POST",
			url: "getpod",
			data: JSON.stringify({ ip: ip, port: port }),
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.PollDone,
			error: (req, status, error) => window.alert("AJAX error")
		});
		if(this._timer !== null) clearTimeout(this._timer);
		this._timer = setTimeout(this.Poll, 10000+Math.floor(Math.random() * 10000));
	};
	
	private PollDone = (json:any, status:any, req:any): void =>
	{
		let html: string = "Pods:</br>";
		this._discoveredPods = this.MergeArrays(this._discoveredPods, [json.pod_ip]);
		for(let i in this._discoveredPods)
		{
			html += `${this._discoveredPods[i]}<br/>`;
		}
		$("#pods").html(html);
	}
	
	private MergeArrays(a: string[], b: string[]): string[]
	{
		return a.concat(b.filter((item) => a.indexOf(item) < 0))
	}
	
	private ActionButtonClick = (e : JQuery.Event) => {
		let data: any = {
			action: String($("#service-action").val()).toLowerCase(),
			ip: String($("#ip-textbox").val()),
			port: String($("#port-textbox").val()),
			path: String($("#path-textbox").val()),
			reqbody: String($("#req-body-textbox").val())
		};

		$.ajax({
			cache: false,
			type: "POST",
			url: "serviceaction",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.Done,
			error: (req, status, error) => window.alert("AJAX error")
		});

		e.preventDefault();
		return false;
	};
	
	private Done(json:any, status:any, req:any): void
	{		
		 $("#status").html(JSON.stringify(json));
	}
}	
	
(function ()
{
	(new IndexPage()).Start();
})();
