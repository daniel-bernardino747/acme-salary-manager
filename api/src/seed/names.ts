import type { CountryCode } from '@acme/contract';

/**
 * The seed's name lists (ADR 0005, *Names*): Latin script, one "Given Family" order everywhere,
 * Japanese names romanized and Indian names from several regions. Accented names (João, Müller)
 * exercise accent folding, and apostrophe and hyphen names (O'Connor, Anna-Lena) the tokenizer's
 * word splitting. There is no `ß`: the search tokenizer does not fold it to `ss` (ADR 0002).
 */
// Compact blocks, not one name per line.
// prettier-ignore
export const namesByCountry: Record<
  CountryCode,
  { given: readonly string[]; family: readonly string[] }
> = {
  US: {
    given: [
      'James', 'Mary', 'Michael', 'Patricia', 'Robert', 'Jennifer', 'David', 'Linda', 'William',
      'Elizabeth', 'Richard', 'Barbara', 'Joseph', 'Susan', 'Thomas', 'Jessica', 'Christopher',
      'Sarah', 'Daniel', 'Karen', 'Matthew', 'Lisa', 'Anthony', 'Nancy', 'Mark', 'Ashley', 'Steven',
      'Emily', 'Andrew', 'Michelle', 'Joshua', 'Amanda', 'Kevin', 'Melissa', 'Brian', 'Stephanie',
      'Jason', 'Rebecca', 'Ryan', 'Laura', 'Tyler', 'Hannah', 'Marcus', 'Jasmine', 'Diego', 'Sofia',
      'Andre', 'Keisha', 'Ethan', 'Chloe',
    ],
    family: [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
      'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
      'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
      'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres',
      'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
      'Mitchell', 'Carter', 'Roberts',
    ],
  },
  GB: {
    given: [
      'Oliver', 'Amelia', 'George', 'Isla', 'Harry', 'Ava', 'Jack', 'Olivia', 'Charlie', 'Emily',
      'Thomas', 'Sophie', 'Oscar', 'Grace', 'William', 'Lily', 'James', 'Freya', 'Henry', 'Ella',
      'Alfie', 'Poppy', 'Joshua', 'Evie', 'Leo', 'Isabella', 'Archie', 'Ruby', 'Alexander', 'Chloe',
      'Edward', 'Holly', 'Samuel', 'Lucy', 'Daniel', 'Megan', 'Callum', 'Niamh', 'Rhys', 'Siobhan',
      'Ewan', 'Eilidh', 'Owen', 'Bethan', 'Aidan', 'Ciara', 'Rory', 'Imogen', 'Hamish', 'Zara',
    ],
    family: [
      'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson',
      'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson',
      'Clarke', 'Patel', 'Khan', 'Lewis', 'James', 'Phillips', 'Mason', 'Mitchell', 'Rose', 'Davis',
      'Rodgers', 'Hughes', 'Turner', 'Edwards', 'Cooper', 'Harris', 'Morgan', 'Price', 'Bennett',
      'Griffiths', 'Ward', 'MacDonald', 'Campbell', 'Stewart', 'Murray', "O'Connor", "O'Brien",
      'Fletcher', 'Barker', 'Ellis', 'Ahmed',
    ],
  },
  DE: {
    given: [
      'Anna-Lena', 'Lukas', 'Leonie', 'Jonas', 'Hannah', 'Felix', 'Lea', 'Maximilian', 'Lena',
      'Paul', 'Marie', 'Elias', 'Sophie', 'Ben', 'Mia', 'Finn', 'Emma', 'Leon', 'Johanna', 'Tim',
      'Laura', 'Niklas', 'Julia', 'Moritz', 'Sarah', 'Jan', 'Katharina', 'Tobias', 'Clara',
      'Florian', 'Lisa', 'Sebastian', 'Charlotte', 'Jürgen', 'Anja', 'Uwe', 'Sabine', 'Jörg', 'Ute',
      'Matthias', 'Birgit', 'Dominik', 'Jana', 'Karl-Heinz', 'Greta', 'Fabian', 'Annika', 'Malte',
      'Merle', 'Hans-Peter',
    ],
    family: [
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz',
      'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann',
      'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner',
      'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann',
      'König', 'Walter', 'Mayer', 'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller',
      'Jung', 'Hahn', 'Vogel', 'Friedrich',
    ],
  },
  NL: {
    given: [
      'Daan', 'Emma', 'Sem', 'Julia', 'Lucas', 'Mila', 'Levi', 'Tess', 'Finn', 'Sophie', 'Milan',
      'Zoë', 'Jesse', 'Sara', 'Thijs', 'Anna', 'Bram', 'Eva', 'Ruben', 'Lotte', 'Stijn', 'Fleur',
      'Lars', 'Noor', 'Jeroen', 'Saskia', 'Pieter', 'Anouk', 'Joost', 'Ilse', 'Maarten', 'Femke',
      'Sander', 'Marloes', 'Wouter', 'Ingrid', 'Bas', 'Esther', 'Koen', 'Lieke', 'Niels', 'Merel',
      'Hendrik', 'Willemijn', 'Gijs', 'Roos', 'Teun', 'Isa', 'Floris', 'Lieve',
    ],
    family: [
      'de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser',
      'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks',
      'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf', 'van der Meer',
      'van der Linden', 'Kok', 'Jacobs', 'de Haan', 'Vermeulen', 'van den Heuvel', 'van der Veen',
      'van den Broek', 'de Bruijn', 'de Bruin', 'van der Heijden', 'Schouten', 'van Beek', 'Willems',
      'van Vliet', 'van de Ven', 'Hoekstra', 'Maas', 'Verhoeven', 'Koster', 'van Dam', 'van der Wal',
      'Prins', 'Blom', 'Huisman',
    ],
  },
  IN: {
    given: [
      'Aarav', 'Priya', 'Vivaan', 'Ananya', 'Aditya', 'Diya', 'Arjun', 'Kavya', 'Rohan', 'Ishita',
      'Rahul', 'Sneha', 'Vikram', 'Pooja', 'Karthik', 'Lakshmi', 'Suresh', 'Divya', 'Ramesh', 'Meera',
      'Arun', 'Deepa', 'Venkatesh', 'Revathi', 'Sanjay', 'Neha', 'Amit', 'Swati', 'Rajesh', 'Anjali',
      'Manoj', 'Shreya', 'Abhishek', 'Nandini', 'Siddharth', 'Pallavi', 'Harpreet', 'Gurpreet',
      'Simran', 'Jaspreet', 'Sourav', 'Ritika', 'Debashis', 'Moumita', 'Anirban', 'Farhan', 'Ayesha',
      'Imran', 'Zainab', 'Joseph',
    ],
    family: [
      'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Mehta', 'Desai', 'Joshi',
      'Iyer', 'Nair', 'Menon', 'Pillai', 'Reddy', 'Rao', 'Naidu', 'Krishnan', 'Subramanian',
      'Venkataraman', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Das', 'Bose', 'Ghosh', 'Sen', 'Dutta',
      'Kulkarni', 'Deshpande', 'Patil', 'Jadhav', 'Gill', 'Sandhu', 'Dhillon', 'Grewal', 'Kaur',
      'Agarwal', 'Bansal', 'Malhotra', 'Kapoor', 'Chopra', 'Khan', 'Qureshi', 'Siddiqui', 'Fernandes',
      "D'Souza", 'Pereira', 'Thomas', 'Hegde',
    ],
  },
  BR: {
    given: [
      'João', 'Maria', 'José', 'Ana', 'Pedro', 'Juliana', 'Lucas', 'Fernanda', 'Gabriel', 'Beatriz',
      'Rafael', 'Camila', 'Matheus', 'Larissa', 'Gustavo', 'Letícia', 'Felipe', 'Mariana', 'Bruno',
      'Aline', 'Thiago', 'Patrícia', 'Rodrigo', 'Vitória', 'Diego', 'Luana', 'André', 'Bianca',
      'Leonardo', 'Carolina', 'Marcelo', 'Débora', 'Eduardo', 'Natália', 'Vinícius', 'Isabela',
      'Caio', 'Lívia', 'Fábio', 'Renata', 'Otávio', 'Cecília', 'Sérgio', 'Márcia', 'Henrique',
      'Lúcia', 'Antônio', 'Tânia', 'Igor', 'Raquel',
    ],
    family: [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima',
      'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes',
      'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques',
      'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira',
      'Araújo', 'Monteiro', 'Correia', 'Moura', 'Cavalcanti', 'Brandão', 'Magalhães', 'Pinto',
      'Siqueira', 'Batista', 'Campos', 'Castro', 'Azevedo', 'Assunção', 'Conceição',
    ],
  },
  JP: {
    given: [
      'Haruto', 'Yui', 'Sota', 'Hina', 'Yuto', 'Aoi', 'Riku', 'Sakura', 'Ren', 'Yuna', 'Kaito', 'Mei',
      'Hiroshi', 'Yoko', 'Takashi', 'Keiko', 'Kenji', 'Naoko', 'Daisuke', 'Emi', 'Shota', 'Ayaka',
      'Kazuki', 'Misaki', 'Takumi', 'Nanami', 'Yusuke', 'Haruka', 'Ryota', 'Mai', 'Tatsuya', 'Rina',
      'Kenta', 'Saki', 'Koji', 'Akiko', 'Makoto', 'Tomoko', 'Satoshi', 'Megumi', 'Hiroki', 'Yumi',
      'Naoki', 'Kana', 'Taro', 'Chihiro', 'Shun', 'Asuka', 'Masato', 'Eri',
    ],
    family: [
      'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura',
      'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Matsumoto', 'Inoue', 'Kimura',
      'Hayashi', 'Shimizu', 'Yamazaki', 'Mori', 'Abe', 'Ikeda', 'Hashimoto', 'Yamashita', 'Ishikawa',
      'Nakajima', 'Maeda', 'Fujita', 'Ogawa', 'Goto', 'Okada', 'Hasegawa', 'Murakami', 'Kondo',
      'Ishii', 'Saito', 'Sakamoto', 'Endo', 'Aoki', 'Fujii', 'Nishimura', 'Fukuda', 'Ota', 'Miura',
      'Fujiwara', 'Okamoto', 'Matsuda', 'Nakagawa', 'Nakano',
    ],
  },
};
