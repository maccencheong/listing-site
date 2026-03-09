body{
font-family:Arial,Helvetica,sans-serif;
margin:0;
background:#f5f5f5;
}

h1{
text-align:center;
margin:20px 0;
}

/* MAIN PAGE GRID */

#listings{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
gap:20px;
padding:20px;
max-width:1400px;
margin:auto;
}

/* CARD */

.card{
background:white;
border-radius:10px;
overflow:hidden;
box-shadow:0 2px 8px rgba(0,0,0,0.1);
transition:0.2s;
}

.card:hover{
transform:translateY(-4px);
box-shadow:0 6px 14px rgba(0,0,0,0.15);
}

.card a{
text-decoration:none;
color:black;
display:block;
}

.card img{
width:100%;
height:200px;
object-fit:cover;
}

/* CARD INFO */

.info{
padding:12px;
font-size:14px;
line-height:1.5;
}

.price{
font-weight:bold;
font-size:18px;
margin-bottom:5px;
color:#111;
}

/* PAGINATION */

#pagination{
text-align:center;
margin:20px;
}

#pagination button{
padding:8px 14px;
margin:4px;
border:none;
background:#333;
color:white;
border-radius:5px;
cursor:pointer;
}

#pagination button:hover{
background:black;
}

/* LISTING PAGE */

#property{
max-width:900px;
margin:auto;
padding:20px;
}

/* TOP BAR (only listing page) */

.topbar{
display:flex;
justify-content:space-between;
margin-bottom:20px;
}

.topbar button{
padding:8px 14px;
border:none;
background:#333;
color:white;
border-radius:6px;
cursor:pointer;
}

.topbar button:hover{
background:black;
}

/* GALLERY */

.gallery{
display:flex;
align-items:center;
justify-content:center;
gap:10px;
margin-bottom:20px;
}

.gallery img{
max-width:100%;
max-height:500px;
border-radius:8px;
}

.gallery button{
padding:10px 14px;
border:none;
background:#333;
color:white;
border-radius:6px;
cursor:pointer;
}

.gallery button:hover{
background:black;
}

/* LISTING INFO */

#property .info{
font-size:16px;
line-height:1.8;
}

/* MOBILE */

@media(max-width:700px){

.gallery{
flex-direction:column;
}

.gallery button{
width:100%;
}

}
