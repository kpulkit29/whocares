from igraph import *
g=Graph.Read_GML("graph.gml")
p=g.community_multilevel();
print(type(p))
q=g.modularity(p)
print(q)