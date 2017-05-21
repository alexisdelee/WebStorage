# WebStorage

La classe Storage facilite l'utilisation de stockage de données locales (localStorage et sessionStorage). L'utilisation des cookies est utilisée de façon transparente et automatique pour le développeur et les utilisateurs dans le cas où le Web Storage n'est pas reconnu par le navigateur.

## Utilisation

Utilisation du localStorage (10 ans de persistance dans le cas d'utilisation des cookies) avec affectation et récupération des données.

```javascript
const _storage = new Storage(true, 315360000000);

_storage.set("id", "3d48292e4d2714f11c2adf276b610971e068a519");
document.write(_storage.get("id"));
```

L'objet storage peut avoir jusqu'à deux arguments lors de son instanciation (facultatif). La persistance et le nombre de millisecondes avant la destruction du cookie dans le cas de l'utilisation des cookies.

## API

### set

Stocke une valeur et son ID ```(new Storage()).set(id, value)```. La ré-utilisation de set avec un ID déjà utilisé écrasera l'ancienne valeur par la nouvelle.

### get

Récupère une valeur à partir de son ID ```(new Storage()).get(id)```

### remove

Supprime la valeur à partir de l'ID ```(new Storage()).remove(id)```

### removeAll

Supprime toutes les valeurs stockées ```(new Storage()).removeAll()```