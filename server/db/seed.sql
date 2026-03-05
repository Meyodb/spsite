-- Données initiales Soup Juice
-- Exécuter après schema.sql (USE soup_juice; puis source seed.sql;)

SET NAMES utf8mb4;

-- Catégories (ordre = sort_order pour l'affichage menu)
INSERT INTO `category` (`code`, `label_fr`, `label_en`, `sort_order`) VALUES
('JUS', 'Jus', 'Juices', 1),
('SOUPES', 'Soupes', 'Soups', 2),
('PLATS CHAUDS', 'Plats chauds', 'Hot meals', 3),
('SALADES', 'Salades', 'Salads', 4),
('SANDWICH', 'Sandwichs', 'Sandwiches', 5),
('MILKSHAKES', 'Milkshakes', 'Milkshakes', 6),
('BOOSTERS', 'Boosters', 'Boosters', 7),
('DESSERTS', 'Desserts', 'Desserts', 8),
('BOISSONS', 'Boissons', 'Drinks', 9),
('GOODIES', 'Goodies', 'Goodies', 10);

-- Restaurants (exemples)
INSERT INTO `restaurant` (`name`, `city`, `address`, `hours`, `active`, `sort_order`) VALUES
('Soup Juice Paris', 'Paris', '12 rue des Soupes', '9h-21h', 1, 1),
('Soup Juice Lyon', 'Lyon', '5 quai des Jus', '9h-20h', 1, 2);

-- Services par restaurant (Paris : click&collect + terrasse, Lyon : click&collect)
INSERT INTO `restaurant_service` (`restaurant_id`, `service_code`) VALUES
(1, 'click_and_collect'),
(1, 'terrasse'),
(2, 'click_and_collect');

-- Promos (exemples)
INSERT INTO `promo` (`title`, `description`, `code`, `active`) VALUES
('-15% combos midi', 'Du lundi au vendredi', 'MIDI15', 1),
('Livraison offerte > 35€', 'Paris intramuros', NULL, 1);

-- Quelques produits d'exemple (catégorie JUS = id 1, BOOSTERS = 7, etc.)
INSERT INTO `produit` (`id`, `name`, `category_id`, `price`, `volume`, `description`, `visible`) VALUES
(1, 'SLIM DÉTOX', 1, 5.80, '47 cl', 'Ananas, orange, citron vert, menthe', 1),
(2, 'SUNNY WAKE UP', 1, 5.80, '47 cl', 'Açaï, orange, fraise, kiwi', 1),
(3, 'SUPERFLY', 1, 5.80, '47 cl', 'Pomme, citron, gingembre', 1),
(9, 'SPIRULINE', 7, 1.00, NULL, 'Macro et micronutriments, complément alimentaire', 1),
(10, 'CURCUMA', 7, 1.00, NULL, 'Bon pour la santé digestive et hépatique', 1);
