<?php
declare(strict_types=1);

namespace App\Repositories;
use App\Database;
use PDO;


class ProductRepository{
    public function __construct(private Database $database){
    }
    public function getAll(): array{
        $pdo = $this->database->getConnection();

        $stmt = $pdo->query('SELECT * FROM vdm_city');

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}