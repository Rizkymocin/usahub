<?php

namespace Tests\Unit;

use App\Models\Plan;
use App\Repositories\PlanRepository;
use App\Services\PlanService;
use Mockery;
use PHPUnit\Framework\TestCase;
use Illuminate\Support\Collection;

class PlanServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
    }

    public function test_list_plans_calls_repository()
    {
        $repository = Mockery::mock(PlanRepository::class);
        $service = new PlanService($repository);

        $plans = new Collection([]);

        $repository->shouldReceive('getAll')
            ->once()
            ->andReturn($plans);

        $result = $service->listPlans();

        $this->assertEquals($plans, $result);
    }
}
