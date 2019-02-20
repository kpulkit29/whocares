from igraph import *
g=Graph.Read_GML("graph.gml")
p=g.community_edge_betweenness();
d=p.as_clustering()
print(d)