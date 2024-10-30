-- Custom SQL migration file, put you code below! --

--> create-trigger-function
CREATE OR REPLACE FUNCTION calculate_priority()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.customer_total_order_value > 50000 AND NEW.customer_total_order_value <= 300000 THEN
		NEW.customer_priority := 'Mid';
	ELSIF NEW.customer_total_order_value > 300000 THEN
		NEW.customer_priority := 'High';
	ELSE
		NEW.customer_priority := 'Low';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--> create-triggers
CREATE OR REPLACE TRIGGER update_priority_trigger
BEFORE UPDATE OF customer_total_order_value ON customer
FOR EACH ROW
EXECUTE FUNCTION calculate_priority();