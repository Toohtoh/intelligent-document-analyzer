from locust import HttpUser, task, between

class DocAnalyzerUser(HttpUser):
    wait_time = between(1, 3)
    host = "https://app-docanalyzer-25eb89.azurewebsites.net"

    @task(3)
    def health_check(self):
        self.client.get("/health")

    @task(2)
    def get_documents(self):
        self.client.get("/api/v1/documents", headers={
            "Authorization": "Bearer test-token"
        })

    @task(1)
    def share_document(self):
        self.client.get("/api/v1/share/test-id")