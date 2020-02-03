import pymongo
class Mongo:
    def __init__(self):
        client = pymongo.MongoClient("mongodb+srv://admin:admin@netlab-keluq.azure.mongodb.net/netlabdb?retryWrites=true&w=majority")
        self.db = client.netlabdb

    def getExperiments(self,userName):
        """
        Getting the experiment of particular user
        :param userName:the user name key
        :return:experiments
        """
        experiment_array=[]
        experiments=self.db.experiments.find({"userName": userName})
        for exp in experiments:
            #exp.pop('_id')
            experiment_array.append(exp)
        return experiment_array

    def getTask(self,idExp):
        """
        Getting the task of particular experiment
        :param idExp: experiment id
        :return: Tasks
        """
        tasks_array=[]
        tasks=self.db.tasks.find({"idExp": idExp})
        for task in tasks:
            task.pop('_id')
            tasks_array.append(task)
        return tasks_array

    def login(self,inputEmail,password):
        for user in self.db.users.find({"_id":inputEmail, "userPassword":password}):#, "status":"Disconnected"}):
            experiment_array = []
            experiments = self.db.experiments.find({"userName": inputEmail})
            for exp in experiments:
                experiment_array.append(exp)
            return(experiment_array,user["userFullName"])
        return(None,None)

    def createExperiment(self,description,userName,name):
        """
        creating new experiment
        :param description: The description of the new experiment
        :param userName: the user name which created the experiment
        :param name: the name of the experiment
        :return: the generated id of the new experiment
        """
        nextId = self.db.experiments.find_one(sort=[("_id", pymongo.DESCENDING)])
        if (nextId == None):
            nextId = 1
        else:
            nextId = int(nextId.pop('_id')) + 1
        self.db.experiments.insert_one({
            u'_id':nextId,
            u'experimentName': u'' + name + '',
            u'experimentDescription': u'' + description + '',
            u'userName': u'' + userName + '',
            u'tasks': []
        })
        return nextId

    def createTask(self,dataset,datasetcols,name,description,current_experiment_id):
        """
        Creating new task
        :param dataset: the dataset of the experiment
        :param datasetcols: the cols of the experiment
        :param name: the name of the experiment
        :param description: the description of the experiment
        :param current_experiment_id: current experiment id in order to add the new task inside of it
        :return: the task id
        """
        nextId = self.db.experiments.find_one({"_id": current_experiment_id})
        if (len(nextId["tasks"]) == 0):
            nextId = 1
        else:
            nextId = int(nextId["tasks"][-1].pop('task_id')) + 1
        myquery = {"_id": current_experiment_id}
        newvalues = {"$push": {
            "tasks": {"task_id": nextId, "taskName": name, "taskDescription": description, "datasetcols": datasetcols,
                      "dataset": dataset}}}
        self.db.experiments.update_one(myquery, newvalues)
        return(nextId)

    def register(self,inputEmail,password,userFullName):
        """
        Register for a new user
        :param inputEmail: the user key - his email
        :param password: password of the user
        :param userFullName: the user full name
        :return: an error  or successful msg
        """
        try:
            #self.db.users.createIndex({"userName": 1}, {unique: true})
            self.db.users.insert({
                u'_id': u'' + inputEmail + '',
                u'userPassword': u'' + password + '',
                u'userFullName': u'' + userFullName + ''
            })
            return({"status":"registered"})
        except:
            print("error")
            return({"error":"User already exist"})

    def deleteTask(self, idTask, idExp):
        """
        deleting existing task
        :param idTask: task id
        :param idExp: experiment id
        :return: successful or error msg
        """
        myquery = {"_id": idExp}
        newvalues = {"$pull": {"tasks": {"task_id":idTask}}}
        #self.db.experiments.update({},{ $pull: {tasks: { $ in: ["apples", "oranges"]}}},{multi: true})
        value=self.db.experiments.update(myquery, newvalues)
        print(value)