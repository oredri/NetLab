from flask import request,json,jsonify,render_template,Flask
from sklearn.cluster import KMeans
from yellowbrick.cluster import KElbowVisualizer,SilhouetteVisualizer
from server.models.mongoDB import Mongo
import server.models.BayesianNetworkModel as BN
import numpy as np

app = Flask(__name__, static_url_path='/static')
mongo=Mongo()
"""
def run_server(port):
   url = "http://127.0.0.1:" + port + "/"
   chrome_path = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe %s'
   webbrowser.get(chrome_path).open(url)
   app.run(threaded=True, host='127.0.0.1', port=port, debug=False)
"""


@app.route("/")
#returning login template
#Author: Tom Zarhin
def netLabStart():
    return render_template("login.html")

@app.route('/registerscreen', methods=['GET', 'POST'])
#Getting the experiments of the user
#Author: Tom Zarhin
def registerscreen():
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
#Getting the user details and returning his experiments if he exist or else the function returning null
def login():
    inputEmail=request.form.get('inputEmail')
    password = request.form.get('password')
    experiment_array,user_fullname=mongo.login(inputEmail,password)
    if(user_fullname==None):
        return jsonify({'error':"No Such user, please try again"})
    if(experiment_array==None):
        return jsonify({'ok':"new user"})
    return jsonify({'experiments': experiment_array,"fullname":user_fullname})
    #ret= jsonify({'experiments': experiment_array})

@app.route('/register', methods=['GET', 'POST'])
#Getting the user details and creating a new task
#Author: Tom Zarhin
def register():
    inputEmail=request.form.get('inputEmail')
    password = request.form.get('password')
    userFullName=request.form.get('userFullName')
    ack=mongo.register(inputEmail,password,userFullName)
    return jsonify(ack)

@app.route('/createExperiment', methods=['GET', 'POST'])
#Getting the experiment details and creating a new one
#Author: Tom Zarhin
def createExperiment():
    description=request.form.get('description')
    userName=request.form.get('userName')
    name = request.form.get('name')
    nextId=mongo.createExperiment(description,userName,name)
    return jsonify({'nextId':nextId})

@app.route('/createTask', methods=['GET', 'POST'])
#Getting the tasks details and creating a new one
#Author: Tom Zarhin
def createTask():
    dataset = json.loads(request.form['dataset'])
    datasetcols = json.loads(request.form['datasetcols'])
    name=request.form.get('taskname')
    description=request.form.get('taskDescription')
    current_experiment_id=int(request.form.get('current_experiment'))
    nextId=mongo.createTask(dataset,datasetcols,name,description,current_experiment_id)
    return jsonify({'idTask':nextId})

@app.route('/goKmeans', methods=['GET', 'POST'])
#Running Kmeans algorithm for Clustering graph
#Author: Tom Zarhin
def goKmeans():
    clusteringNum = request.form['clusteringNum']
    dataset = json.loads(request.form.get('dataset'))
    if(clusteringNum=='' or int(float(clusteringNum))<2):
      clusteringNum=2
    dataset = np.array(dataset)
    #dataset = np.delete(dataset, 0, 1)
    new_list = list(list(float(a) for a in b if is_number(a)) for b in dataset)
    kmeans = KMeans(n_clusters=int(float(clusteringNum)), random_state=0).fit(new_list)
    new_list_as_array=np.array(new_list)
    SilhouetteVisualize = SilhouetteVisualizer(kmeans)
    SilhouetteVisualize.fit(new_list_as_array)
    if(len(new_list)>10):
        k_upper_bound=10
    else:
        k_upper_bound=len(new_list)
    KElbowVisualize = KElbowVisualizer(KMeans(), k=k_upper_bound)
    KElbowVisualize.fit(new_list_as_array)  # Fit the data to the visualizer
    silhouette = SilhouetteVisualize.silhouette_score_
    elbow = KElbowVisualize.elbow_value_
    return jsonify({'inputArray': list(new_list),'kmeansLabels':(kmeans.labels_.tolist()),'elbowValue':str(elbow),'silhouetteValue':('%.3f' % silhouette)})

@app.route('/goK2', methods=['GET', 'POST'])
#Running K2 algorithm for Bayesian Network Correlation
#Author: Tom Zarhin
def goK2():
    print("Starting K2")

    categories = json.loads(request.form['datasetcols'])
    data = json.loads(request.form['dataset'])
    numberOfParents = request.form['numberOfParents']
    numberOfReasons = request.form['numberOfReasons']
    if(numberOfParents=='' or numberOfParents==None):
        numberOfParents='1000'
    categories=categories.split(',')
    dontKnowTheArrangement = request.form['dontKnowTheArrangement']

    graph_list,dag,data=BN.bayesianNetworkK2AndTables(data,categories,int(numberOfParents),dontKnowTheArrangement,int(numberOfReasons))
    # Finding the Conditional Probabilities Tables
    bayes_model,cpds_array,categories_each_element = BN.createBayesGraph(graph_list, categories, data)

    print("Finising K2")

    return jsonify(
        {'status': 'done', 'dataset_k2': dag.tolist(), 'categories': list(categories), 'cpt_list': cpds_array,
         'element_categories': categories_each_element})
    #return bayesianNetworkK2AndTables(dataset,categories.split(','),int(numberOfParents))

def is_number(digit):
    """
    Check whether the digit is number or not
    :param digit: some character
    :return:true if it is a number, false otherwise
    """
    try:
        float(digit)
        return True
    except ValueError:
        return False

@app.route('/goCoClustering', methods=['GET', 'POST'])
#Contingency table for two different clusters by using kmeans function
#Author: Tom Zarhin
def goCoClustering():

    clusteringNum = request.form['clusteringNum']
    dataset1 = json.loads(request.form.get('dataset1'))
    dataset2 = json.loads(request.form.get('dataset2'))
    if(clusteringNum=='' or int(float(clusteringNum))<2):
      clusteringNum=2
    dataset1 = np.array(dataset1)
    dataset2 = np.array(dataset2)

    if(len(dataset1)!=len(dataset2)):
        return jsonify({"error":"Different length"})

    float_list_of_dataset1 = list(list(float(a) for a in b if is_number(a)) for b in dataset1)
    float_list_of_dataset2 = list(list(float(a) for a in b if is_number(a)) for b in dataset2)

    kmeans_dataset1 = KMeans(n_clusters=int(float(clusteringNum)), random_state=0).fit(float_list_of_dataset1)
    kmeans_dataset2 = KMeans(n_clusters=int(float(clusteringNum)), random_state=0).fit(float_list_of_dataset2)

    labels11=kmeans_dataset1.labels_
    labels12=kmeans_dataset2.labels_

    contingency_table = [[0 for x in range(int(float(clusteringNum)))] for y in range(int(float(clusteringNum)))]

    for id in range(len(float_list_of_dataset1)):
        contingency_table[labels12[id]][labels11[id]]+=int(1)
    contingency_table= zip(*contingency_table)
    return jsonify({'contingency_table':list(contingency_table),'labels1':labels11.tolist(),'labels2':labels12.tolist()})


@app.route('/deleteTask', methods=['GET', 'POST'])
#Deleting task from experiment
#Author: Tom Zarhin
def deleteTask():
    idTask = request.form['idTask']
    idExp = request.form['idExp']
    idTask=int(list(idTask)[1])
    idExp=int(list(idExp)[1])
    mongo.deleteTask(idTask,idExp)
    return jsonify({'status':'deleted'})

@app.route('/goExpBaysienNetwork', methods=['GET', 'POST'])
#Bayesian network for entire experiment
#Author: Tom Zarhin
def goExpBaysienNetwork():
    expDataset = json.loads(request.form.get('expDataset'))
    data_full=expDataset[0]['dataset']
    data_cols=expDataset[0]['datasetcols'].split(',')
    expDataset.pop(0)
    for task in expDataset:
        data_cols=np.append(data_cols, task['datasetcols'].split(','))
        data_full=np.append(data_full, task['dataset'], axis=1)
        #data_cols[:,:-1]=task['datasetcolumn']
    numberOfParents = request.form['numberOfParents']
    if(numberOfParents=='' or numberOfParents==None):
        numberOfParents='1000'
    dontKnowTheArrangement = request.form['dontKnowTheArrangement']

    graph_list,dag,data=BN.bayesianNetworkK2AndTables(list(data_full),data_cols,int(numberOfParents),dontKnowTheArrangement)
    # Finding the Conditional Probabilities Tables
    bayes_model,cpds_array,categories_each_element = BN.createBayesGraph(graph_list, data_cols, data)

    return jsonify(
        {'status': 'done', 'dataset_k2': dag.tolist(), 'categories': list(data_cols), 'cpt_list': cpds_array,
         'element_categories': categories_each_element})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=1000, debug=False)