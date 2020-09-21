# utiproxy

affiche le nombre de pub vues en format texte sur une page web ajoutable en tant que browser source sur OBS

# how to

```shell
git clone https://git.emi.cool/emilweth/UtiProxy.git utiproxy
cd utiproxy
cp docker-compose.example.yml docker-compose.yml
vim docker-compose.yml # do your shit
docker-compose up -d
```

Go to `http://<host>/utip/<utip_id>`

L'ID utip est récupérable dans l'url de l'overlay vidéo

`https://utip.io/video-overlay/<utip_id>?type=counter`
