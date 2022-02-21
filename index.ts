class IndexPage
{
	private _discoveredPods: string[] = [];
	private _timer: any = null;
	
	constructor()  { } 
	
	Start(): void
	{
		$("#start-poll-button").click(this.StartPollButtonClick);
		$("#stop-poll-button").click(this.StopPollButtonClick);
		$("#post-button").click(this.PostButtonClick);
		$("#get-button").click(this.GetButtonClick);
		$("#put-button").click(this.PutButtonClick);
		$("#delete-button").click(this.DeleteButtonClick);
		
		this.UpdatePathPrefix();
		$("#ip-textbox").change(this.UpdatePathPrefix);	
		$("#service-port-textbox").change(this.UpdatePathPrefix);
		$("#via-node-chkbox").change(() => {
			if($("#via-node-chkbox").prop("checked") == true)
			{
				$("#poll-ip-textbox").prop("disabled", false);
				$("#poll-port-textbox").prop("disabled", false);
			}
		});
	}
	
	private UpdatePathPrefix(): void
	{
		let ip: string = String($("#ip-textbox").val());
		let port: string = String($("#service-port-textbox").val());
		$("#path-prefix").html(`http://${ip}:${port}/`);	
	}
	
	private StartPollButtonClick = (e : JQuery.Event) => {
		if($("#via-node-chkbox").prop("checked") == true)
			this.PollViaNode();
		else
			this.Poll();
		e.preventDefault();
		return false;
	};
	
	private Poll = () => 
	{
		let clusterIP: string = String($("#ip-textbox").val());
		let servicePort: string = String($("#service-port-textbox").val());
		$.ajax({
			cache: false,
			type: "POST",
			url: `http://${clusterIP}:${servicePort}/poll`,
			data: {},
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.PollDone,
			error: (req, status, error) => window.alert("AJAX error")
		});
		if(this._timer !== null) clearTimeout(this._timer);
		this._timer = setTimeout(this.Poll, 10000+Math.floor(Math.random() * 10000));
	};
	
	private PollViaNode = () => 
	{
		let observerIP: string = String($("#poll-ip-textbox").val());
		let observerPort: string = String($("#poll-port-textbox").val());
		$.ajax({
			cache: false,
			type: "POST",
			url: `http://${observerIP}:${observerPort}/poll`,
			data: JSON.stringify({
				cluster_ip: String($("#ip-textbox").val()),
				service_port: String($("#service-port-textbox").val())
			}),
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.PollDone,
			error: (req, status, error) => window.alert("AJAX error")
		});
		if(this._timer !== null) clearTimeout(this._timer);
		this._timer = setTimeout(this.PollViaNode, 10000+Math.floor(Math.random() * 10000));
	};
	
	private StopPollButtonClick = (e : JQuery.Event) => {
		if(this._timer !== null) clearTimeout(this._timer);
		this._timer = null;
		e.preventDefault();
		return false;
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
	
	private PostButtonClick = (e : JQuery.Event) => {
		let ip: string = String($("#ip-textbox").val());
		let servicePort: string = String($("#service-port-textbox").val());
		let servicePath: string = String($("#service-path-textbox").val());
		let serviceUrl: string = `http://${ip}:${servicePort}`;
		
		if(servicePath.trim() != "")
		{
			serviceUrl = `${serviceUrl}/${servicePath.trim()}`;
		}

		$.ajax({
			cache: false,
			type: "POST",
			url: serviceUrl,
			data: String($("#post-body-textbox").val()),
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
	
	private GetButtonClick = (e : JQuery.Event) => {
		let ip: string = String($("#ip-textbox").val());
		let servicePort: string = String($("#service-port-textbox").val());
		let servicePath: string = String($("#service-path-textbox").val());
		let serviceUrl: string = `http://${ip}:${servicePort}`;
		
		if(servicePath.trim() != "")
		{
			serviceUrl = `${serviceUrl}/${servicePath.trim()}`;
		}

		$.ajax({
			cache: false,
			type: "GET",
			url: serviceUrl,
			data: {},
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.Done,
			error: (req, status, error) => window.alert("AJAX error")
		});

		e.preventDefault();
		return false;
	};	
	
	private PutButtonClick = (e : JQuery.Event) => {
		let ip: string = String($("#ip-textbox").val());
		let servicePort: string = String($("#service-port-textbox").val());
		let servicePath: string = String($("#service-path-textbox").val());
		let serviceUrl: string = `http://${ip}:${servicePort}`;
		
		if(servicePath.trim() != "")
		{
			serviceUrl = `${serviceUrl}/${servicePath.trim()}`;
		}

		$.ajax({
			cache: false,
			type: "PUT",
			url: serviceUrl,
			data: String($("#put-body-textbox").val()),
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.Done,
			error: (req, status, error) => window.alert("AJAX error")
		});

		e.preventDefault();
		return false;
	};	
	
	private DeleteButtonClick = (e : JQuery.Event) => {
		let ip: string = String($("#ip-textbox").val());
		let servicePort: string = String($("#service-port-textbox").val());
		let servicePath: string = String($("#service-path-textbox").val());
		let serviceUrl: string = `http://${ip}:${servicePort}`;
		
		if(servicePath.trim() != "")
		{
			serviceUrl = `${serviceUrl}/${servicePath.trim()}`;
		}

		$.ajax({
			cache: false,
			type: "DELETE",
			url: serviceUrl,
			data: {},
			contentType: "application/json; charset=utf-8",  
			dataType: "json",
			success: this.Done,
			error: (req, status, error) => window.alert("AJAX error")
		});

		e.preventDefault();
		return false;
	};
}	
	
(function ()
{
	(new IndexPage()).Start();
})();
